import { useState } from "react";
import { Download, FileText, Calendar, Database, Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  size: string;
  icon: React.ComponentType<{ className?: string }>;
}

const exportOptions: ExportOption[] = [
  {
    id: 'dog-profiles',
    label: 'Dog Profiles',
    description: 'Basic information, photos, and breed details',
    size: '~2MB',
    icon: Database,
  },
  {
    id: 'health-records',
    label: 'Health Records',
    description: 'Vet visits, vaccinations, and health notes',
    size: '~1.5MB',
    icon: FileText,
  },
  {
    id: 'weight-tracking',
    label: 'Weight Tracking',
    description: 'Historical weight measurements and trends',
    size: '~500KB',
    icon: Calendar,
  },
  {
    id: 'nutrition-plans',
    label: 'Nutrition Plans',
    description: 'Meal plans, feeding schedules, and dietary notes',
    size: '~800KB',
    icon: FileText,
  },
  {
    id: 'training-sessions',
    label: 'Training Sessions',
    description: 'AI conversations, trick progress, and achievements',
    size: '~3MB',
    icon: Database,
  },
  {
    id: 'marketplace-orders',
    label: 'Marketplace Orders',
    description: 'Purchase history and order details',
    size: '~1MB',
    icon: FileText,
  },
];

export function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [dateRange, setDateRange] = useState<'all' | '1year' | '6months' | '3months'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const selectAll = () => {
    setSelectedOptions(exportOptions.map(option => option.id));
  };

  const deselectAll = () => {
    setSelectedOptions([]);
  };

  const calculateTotalSize = () => {
    const selectedSizes = exportOptions
      .filter(option => selectedOptions.includes(option.id))
      .map(option => parseFloat(option.size.replace(/[^\d.]/g, '')));
    
    const total = selectedSizes.reduce((sum, size) => sum + size, 0);
    return total > 1000 ? `${(total / 1000).toFixed(1)}GB` : `${total.toFixed(1)}MB`;
  };

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No data selected",
        description: "Please select at least one data type to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExporting(false);
          toast({
            title: "Export completed!",
            description: "Your data has been exported and will be emailed to you shortly.",
          });
          onClose();
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json':
        return 'Machine-readable format, best for developers';
      case 'csv':
        return 'Spreadsheet-compatible, good for analysis';
      case 'pdf':
        return 'Human-readable report format';
      default:
        return '';
    }
  };

  const getDateRangeDescription = (range: string) => {
    switch (range) {
      case 'all':
        return 'All available data';
      case '1year':
        return 'Last 12 months';
      case '6months':
        return 'Last 6 months';
      case '3months':
        return 'Last 3 months';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl h-[calc(100vh-4rem)] max-h-[600px] flex flex-col mx-2 my-8">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Your Data
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your data for backup or transfer to another service. We'll email you a download link when ready.
          </p>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Export Progress */}
          {isExporting && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-primary animate-bounce" />
                <span className="font-medium">Exporting your data...</span>
              </div>
              <Progress value={exportProgress} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                This may take a few minutes depending on the amount of data.
              </p>
            </div>
          )}

          {/* Data Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Select Data to Export</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs">
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedOptions.includes(option.id)
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-card hover:bg-secondary/20'
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedOptions.includes(option.id)}
                        className="mt-1"
                      />
                      <Icon className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {option.size}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedOptions.length > 0 && (
              <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Selected: {selectedOptions.length} data types</span>
                  <span className="font-medium">Total size: ~{calculateTotalSize()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium mb-2 block">Export Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as typeof format)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getFormatDescription(format)}
              </p>
            </div>

            <div>
              <Label className="font-medium mb-2 block">Date Range</Label>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as typeof dateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getDateRangeDescription(dateRange)}
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Privacy & Security</div>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Your data will be encrypted during export</li>
                  <li>• Download links expire after 7 days</li>
                  <li>• No personal data is shared with third parties</li>
                  <li>• You can request deletion after export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex-1" disabled={isExporting || selectedOptions.length === 0}>
            {isExporting ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Email Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}