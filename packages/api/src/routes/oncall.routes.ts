import { Router } from 'express';
import { OnCallClient } from '../../../../src/integrations/oncall.client.js';
import { getLeadById, findLeads, updateLead } from '../../../../src/storage/lead.repository.js';

export const oncallRouter = Router();

const oncallClient = new OnCallClient();

// Test OnCall connection
oncallRouter.get('/oncall/status', async (_req, res) => {
  const result = await oncallClient.testConnection();
  res.json({ success: true, data: result });
});

// Push a single lead to OnCall
oncallRouter.post('/oncall/push/:leadId', async (req, res) => {
  const { leadId } = req.params;

  const lead = getLeadById(leadId);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead not found' });
  }

  const result = await oncallClient.pushLead(lead);

  if (result.success) {
    // Update lead status to indicate it was pushed
    updateLead(leadId, { status: 'Exported' });
    res.json({ success: true, data: result });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// Push multiple leads to OnCall
oncallRouter.post('/oncall/push-bulk', async (req, res) => {
  const { leadIds } = req.body as { leadIds: string[] };

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ success: false, error: 'leadIds array required' });
  }

  const leads = leadIds
    .map(id => getLeadById(id))
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null);

  if (leads.length === 0) {
    return res.status(404).json({ success: false, error: 'No leads found' });
  }

  const result = await oncallClient.pushLeads(leads);

  // Update successfully pushed leads
  result.results.forEach((r, index) => {
    if (r.success && leads[index]) {
      updateLead(leads[index].id, { status: 'Exported' });
    }
  });

  res.json({ success: true, data: result });
});

// Push all leads by filter
oncallRouter.post('/oncall/push-all', async (req, res) => {
  const { status, trade, source } = req.body as {
    status?: string;
    trade?: string;
    source?: string;
  };

  let leads = findLeads();

  // Apply filters
  if (status) {
    leads = leads.filter(l => l.status === status);
  }
  if (trade) {
    leads = leads.filter(l => l.trade === trade);
  }
  if (source) {
    leads = leads.filter(l => l.source === source);
  }

  if (leads.length === 0) {
    return res.status(404).json({ success: false, error: 'No leads match filters' });
  }

  const result = await oncallClient.pushLeads(leads);

  // Update successfully pushed leads
  result.results.forEach((r, index) => {
    if (r.success && leads[index]) {
      updateLead(leads[index].id, { status: 'Exported' });
    }
  });

  res.json({ success: true, data: result });
});
