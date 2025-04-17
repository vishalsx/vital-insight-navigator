import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, BookOpen, Video, File, Paperclip, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock resources data
const resources = [
  {
    id: 1,
    title: "Clinical Guidelines for Diabetes Management",
    type: "document",
    category: "guidelines",
    format: "PDF",
    size: "2.4 MB",
    lastUpdated: "2025-03-15",
    accessLevel: "all-staff"
  },
  {
    id: 2,
    title: "Patient Data Privacy Compliance",
    type: "document",
    category: "policies",
    format: "PDF",
    size: "1.8 MB",
    lastUpdated: "2025-02-28",
    accessLevel: "all-staff"
  },
  {
    id: 3,
    title: "Advanced Cardiology Diagnostic Procedures",
    type: "training",
    category: "educational",
    format: "Video",
    size: "248 MB",
    lastUpdated: "2025-01-10",
    accessLevel: "medical-staff"
  },
  {
    id: 4,
    title: "Electronic Health Records User Manual",
    type: "manual",
    category: "technical",
    format: "PDF",
    size: "3.5 MB",
    lastUpdated: "2025-03-22",
    accessLevel: "all-staff"
  },
  {
    id: 5,
    title: "Medication Administration Protocol",
    type: "protocol",
    category: "guidelines",
    format: "PDF",
    size: "1.2 MB",
    lastUpdated: "2025-02-05",
    accessLevel: "medical-staff"
  },
  {
    id: 6,
    title: "Emergency Response Procedures",
    type: "protocol",
    category: "emergency",
    format: "PDF",
    size: "4.1 MB",
    lastUpdated: "2025-03-01",
    accessLevel: "all-staff"
  }
];

const ResourceCard = ({ resource }: { resource: typeof resources[0] }) => {
  const { toast } = useToast();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'training':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'manual':
        return <BookOpen className="h-6 w-6 text-green-500" />;
      case 'protocol':
        return <File className="h-6 w-6 text-orange-500" />;
      default:
        return <Paperclip className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: `Downloading ${resource.title}`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {getIcon(resource.type)}
          <Badge variant="outline">{resource.category}</Badge>
        </div>
        <CardTitle className="mt-2 line-clamp-2">{resource.title}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-xs">
            <span>{resource.format}</span>
            <span>•</span>
            <span>{resource.size}</span>
            <span>•</span>
            <span>Updated: {new Date(resource.lastUpdated).toLocaleDateString()}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <div className="flex w-full justify-between">
          <Badge variant="secondary">{resource.accessLevel}</Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || resource.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="educational">Educational</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No resources found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </TabsContent>

        {
          ["guidelines", "policies", "educational", "technical", "emergency"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {/* Content will be shown based on filtering logic */}
              {filteredResources.filter(resource => resource.category === tab).length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.filter(resource => resource.category === tab).map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">No resources found in {tab}</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </TabsContent>
          ))
        }
      </Tabs>
    </div>
  );
};

export default Resources;
