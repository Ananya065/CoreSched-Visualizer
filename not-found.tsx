import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 shadow-xl border-border">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The scheduler couldn't find a process matching this path. 
            </p>
          </div>
          <Link href="/">
            <Button className="hover-elevate">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
