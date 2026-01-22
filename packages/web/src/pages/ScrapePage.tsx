import { useState } from 'react';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { LeadSource, Trade, ScrapeResult } from '../types';

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'Google Maps', label: 'Google Maps' },
  { value: 'Yelp', label: 'Yelp' },
  { value: 'HomeAdvisor', label: 'HomeAdvisor' },
  { value: 'Angi', label: 'Angi' },
  { value: 'Thumbtack', label: 'Thumbtack' },
  { value: 'BBB', label: 'BBB' },
];

const TRADES: { value: Trade; label: string }[] = [
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Roofing', label: 'Roofing' },
  { value: 'General Contractor', label: 'General Contractor' },
];

export function ScrapePage() {
  const [selectedSources, setSelectedSources] = useState<LeadSource[]>([]);
  const [selectedTrades, setSelectedTrades] = useState<Trade[]>([]);
  const [location, setLocation] = useState({
    city: '',
    county: 'Westchester County',
    state: 'NY',
  });
  const [maxResults, setMaxResults] = useState(100);
  const [skipDeduplication, setSkipDeduplication] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (source: LeadSource) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const toggleTrade = (trade: Trade) => {
    setSelectedTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    );
  };

  const handleScrape = async () => {
    if (selectedSources.length === 0) {
      setError('Please select at least one source');
      return;
    }
    if (selectedTrades.length === 0) {
      setError('Please select at least one trade');
      return;
    }

    setScraping(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.startScrape({
        sources: selectedSources,
        trades: selectedTrades,
        location,
        maxResultsPerSource: maxResults,
        skipDeduplication,
      });
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape failed');
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Sources</h3>
          <p className="text-sm text-navy-600 mb-4">Select the platforms to scrape from</p>
          <div className="space-y-3">
            {SOURCES.map((source) => (
              <Checkbox
                key={source.value}
                label={source.label}
                checked={selectedSources.includes(source.value)}
                onChange={() => toggleSource(source.value)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Trades</h3>
          <p className="text-sm text-navy-600 mb-4">Select the contractor types to find</p>
          <div className="space-y-3">
            {TRADES.map((trade) => (
              <Checkbox
                key={trade.value}
                label={trade.label}
                checked={selectedTrades.includes(trade.value)}
                onChange={() => toggleTrade(trade.value)}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            value={location.city}
            onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="e.g. White Plains"
          />
          <Input
            label="County"
            value={location.county}
            onChange={(e) => setLocation((prev) => ({ ...prev, county: e.target.value }))}
            placeholder="e.g. Westchester County"
          />
          <Input
            label="State"
            value={location.state}
            onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))}
            placeholder="e.g. NY"
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Max Results Per Source"
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value) || 100)}
            min={1}
            max={1000}
          />
          <div className="flex items-end">
            <Checkbox
              label="Skip Deduplication"
              checked={skipDeduplication}
              onChange={setSkipDeduplication}
            />
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle size={20} />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700 mb-4">
            <CheckCircle size={20} />
            <p className="font-semibold">Scrape completed successfully</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-700">{result.totalFound}</p>
              <p className="text-sm text-green-600">Found</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{result.totalSaved}</p>
              <p className="text-sm text-green-600">Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{result.totalDuplicates}</p>
              <p className="text-sm text-amber-600">Duplicates</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-sm text-red-600">
                  {err.source}: {err.error}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleScrape} disabled={scraping} size="lg">
          {scraping ? (
            <>
              <Spinner size="sm" />
              Scraping...
            </>
          ) : (
            <>
              <Play size={20} />
              Start Scrape
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
