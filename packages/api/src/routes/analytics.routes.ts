/**
 * Analytics routes - dashboard metrics and insights
 */

import { Router } from 'express';
import {
  getTotalLeadCount,
  countLeadsByStatus,
  countLeadsBySource,
  countLeadsByTrade,
  getLeadsByDate,
  getDataQualityMetrics,
  getSourceComparison,
  getTrendData,
  getRecentActivity,
} from '../../../../src/storage/lead.repository.js';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/overview
 * Get all dashboard metrics in one call
 */
analyticsRouter.get('/overview', (_req, res) => {
  const total = getTotalLeadCount();
  const byStatus = countLeadsByStatus();
  const bySource = countLeadsBySource();
  const byTrade = countLeadsByTrade();
  const quality = getDataQualityMetrics();
  const trends = getTrendData(7);

  res.json({
    success: true,
    data: {
      total,
      byStatus,
      bySource,
      byTrade,
      quality: {
        emailRate: total > 0 ? (quality.withEmail / total) * 100 : 0,
        phoneRate: total > 0 ? (quality.withPhone / total) * 100 : 0,
        addressRate: total > 0 ? (quality.withAddress / total) * 100 : 0,
        websiteRate: total > 0 ? (quality.withWebsite / total) * 100 : 0,
        duplicateRate: total > 0 ? (quality.duplicateCount / total) * 100 : 0,
        enrichedRate: total > 0 ? (quality.enrichedCount / total) * 100 : 0,
        verifiedRate: total > 0 ? (quality.verifiedCount / total) * 100 : 0,
        averageConfidence: quality.averageConfidence,
      },
      trends: {
        thisWeek: trends.currentPeriod,
        lastWeek: trends.previousPeriod,
        changePercent: trends.changePercent,
        thisWeekWithEmail: trends.currentWithEmail,
        lastWeekWithEmail: trends.previousWithEmail,
        emailChangePercent: trends.emailChangePercent,
      },
    },
  });
});

/**
 * GET /api/analytics/timeline
 * Get leads over time for line charts
 */
analyticsRouter.get('/timeline', (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = getLeadsByDate(startDate, endDate, groupBy);

  res.json({
    success: true,
    data: {
      timeline: data,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      groupBy,
    },
  });
});

/**
 * GET /api/analytics/quality
 * Get data quality metrics
 */
analyticsRouter.get('/quality', (_req, res) => {
  const quality = getDataQualityMetrics();
  const total = quality.totalLeads;

  res.json({
    success: true,
    data: {
      total,
      withEmail: quality.withEmail,
      withPhone: quality.withPhone,
      withAddress: quality.withAddress,
      withWebsite: quality.withWebsite,
      duplicateCount: quality.duplicateCount,
      enrichedCount: quality.enrichedCount,
      verifiedCount: quality.verifiedCount,
      rates: {
        email: total > 0 ? (quality.withEmail / total) * 100 : 0,
        phone: total > 0 ? (quality.withPhone / total) * 100 : 0,
        address: total > 0 ? (quality.withAddress / total) * 100 : 0,
        website: total > 0 ? (quality.withWebsite / total) * 100 : 0,
        duplicate: total > 0 ? (quality.duplicateCount / total) * 100 : 0,
        enriched: total > 0 ? (quality.enrichedCount / total) * 100 : 0,
        verified: total > 0 ? (quality.verifiedCount / total) * 100 : 0,
      },
      averageConfidence: quality.averageConfidence,
    },
  });
});

/**
 * GET /api/analytics/sources
 * Get source comparison metrics
 */
analyticsRouter.get('/sources', (_req, res) => {
  const sources = getSourceComparison();

  const data = sources.map(source => ({
    source: source.source,
    total: source.total,
    withEmail: source.withEmail,
    withPhone: source.withPhone,
    withWebsite: source.withWebsite,
    emailRate: source.total > 0 ? (source.withEmail / source.total) * 100 : 0,
    phoneRate: source.total > 0 ? (source.withPhone / source.total) * 100 : 0,
    websiteRate: source.total > 0 ? (source.withWebsite / source.total) * 100 : 0,
    averageRating: source.averageRating,
    duplicateCount: source.duplicateCount,
    duplicateRate: source.total > 0 ? (source.duplicateCount / source.total) * 100 : 0,
  }));

  res.json({
    success: true,
    data: {
      sources: data,
    },
  });
});

/**
 * GET /api/analytics/trends
 * Get period-over-period comparison
 */
analyticsRouter.get('/trends', (req, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const trends = getTrendData(days);

  res.json({
    success: true,
    data: {
      periodDays: days,
      current: {
        total: trends.currentPeriod,
        withEmail: trends.currentWithEmail,
      },
      previous: {
        total: trends.previousPeriod,
        withEmail: trends.previousWithEmail,
      },
      change: {
        total: trends.changePercent,
        withEmail: trends.emailChangePercent,
      },
    },
  });
});

/**
 * GET /api/analytics/activity
 * Get recent activity for sparklines
 */
analyticsRouter.get('/activity', (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const activity = getRecentActivity(days);

  res.json({
    success: true,
    data: {
      activity,
      days,
    },
  });
});
