import React from 'react';
import { LogEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimestamp } from '@/services/logService';

interface LogDetailsProps {
  log: LogEntry | null;
}

const LogDetails: React.FC<LogDetailsProps> = ({ log }) => {
  if (!log) {
    return null;
  }

  const commonFields = ['@timestamp', 'level', 'message', 'correlationId', 'module', 'context'];
  const additionalFields = Object.entries(log).filter(
    ([key]) => !commonFields.includes(key)
  );

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Log Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Timestamp</h3>
            <p className="text-sm">{formatTimestamp(log['@timestamp'])}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Level</h3>
            <p className="text-sm">{log.level}</p>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-medium mb-2">Message</h3>
            <p className="text-sm p-2 bg-muted/50 rounded-md">{log.message}</p>
          </div>
          
          {log.correlationId && (
            <div className="md:col-span-2">
              <h3 className="font-medium mb-2">Correlation ID</h3>
              <p className="text-sm font-mono">{log.correlationId}</p>
            </div>
          )}
          
          {log.module && (
            <div>
              <h3 className="font-medium mb-2">Module</h3>
              <p className="text-sm">{typeof log.module === 'object' ? JSON.stringify(log.module) : String(log.module)}</p>
            </div>
          )}
          
          {log.context && (
            <div>
              <h3 className="font-medium mb-2">Context</h3>
              <p className="text-sm">{typeof log.context === 'object' ? JSON.stringify(log.context) : String(log.context)}</p>
            </div>
          )}
        </div>
        
        {additionalFields.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Additional Fields</h3>
            <div className="bg-muted/50 rounded-md p-2 overflow-auto max-h-60">
              <pre className="text-xs">
                {JSON.stringify(
                  Object.fromEntries(additionalFields), 
                  null, 
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogDetails;
