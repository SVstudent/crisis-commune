import incidentsData from '@/data/incidents.json';
import logsData from '@/data/logs.json';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze emergency call transcript using AI agents
 * Returns simulated agent responses and incident data
 */
export async function analyzeCall(transcript: string): Promise<any> {
  await delay(500); // Simulate API call delay
  
  // Mock analysis based on transcript content
  const hasEmergency = transcript.toLowerCase().includes('emergency') || 
                      transcript.toLowerCase().includes('help') ||
                      transcript.toLowerCase().includes('fire') ||
                      transcript.toLowerCase().includes('accident');
  
  return {
    incident: {
      id: `INC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      type: hasEmergency ? 'Medical Emergency' : 'General Inquiry',
      severity: hasEmergency ? 'high' : 'low',
      confidence: 0.85 + Math.random() * 0.15,
      status: 'confirmed',
      location: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        address: '123 Market Street, San Francisco, CA'
      },
      timestamp: new Date().toISOString(),
      description: transcript.substring(0, 100)
    },
    agentResponses: [
      {
        agent: 'Intake Agent',
        message: 'Call received and transcript processed. Extracting key information...',
        timestamp: new Date().toISOString(),
        confidence: 0.95
      },
      {
        agent: 'Geo Locator',
        message: 'Location identified and geocoded successfully.',
        timestamp: new Date().toISOString(),
        confidence: 0.92
      },
      {
        agent: 'Severity Analyzer',
        message: hasEmergency ? 'High priority emergency detected.' : 'Low priority inquiry detected.',
        timestamp: new Date().toISOString(),
        confidence: 0.88
      },
      {
        agent: 'Dispatcher',
        message: hasEmergency ? 'Emergency units dispatched, ETA 5 minutes.' : 'Routing to appropriate department.',
        timestamp: new Date().toISOString(),
        confidence: 0.97
      }
    ]
  };
}

/**
 * Fetch current incidents and resources for map display
 */
export async function getMapData(): Promise<any> {
  await delay(300); // Simulate API call delay
  
  return {
    incidents: incidentsData.incidents,
    resources: incidentsData.resources
  };
}

/**
 * Fetch agent activity logs
 */
export async function getLogs(): Promise<any> {
  await delay(200); // Simulate API call delay
  
  return {
    logs: logsData.logs
  };
}
