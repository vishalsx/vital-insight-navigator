
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <FileSearch className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">
          The page you're looking for couldn't be found
        </p>
        <p className="text-muted-foreground">
          The path <code className="text-primary">{location.pathname}</code> doesn't exist in this Clinical Data Management System.
        </p>
        <Button asChild size="lg">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
