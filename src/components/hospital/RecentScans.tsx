import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { History, User, QrCode, Keyboard } from 'lucide-react';
import { getRelativeTime } from '@/lib/constants';

interface RecentScansProps {
  onSelectPatient: (patientId: string) => void;
  refreshTrigger: number;
}

export function RecentScans({ onSelectPatient, refreshTrigger }: RecentScansProps) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const res = await fetch('/api/hospital/scan-log');
        if (res.ok) {
          const data = await res.json();
          setScans(data);
        }
      } catch (err) {
        console.error('Failed to fetch recent scans', err);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, [refreshTrigger]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <History className="h-4 w-4" /> RECENT SCANS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : scans.length > 0 ? (
          <div className="space-y-1">
            {scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => onSelectPatient(scan.patientId)}
                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors text-left"
              >
                <Avatar className="h-10 w-10 border border-primary/10">
                  <AvatarImage src={scan.patient.image || ''} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scan.patient.name}</p>
                  <p className="text-xs text-muted-foreground">{getRelativeTime(scan.scannedAt)}</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase gap-1 shrink-0">
                  {scan.method === 'QR' ? <QrCode className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                  {scan.method}
                </Badge>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-4">No recent scans</p>
        )}
      </CardContent>
    </Card>
  );
}
