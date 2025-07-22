import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0">
          <HelpCircle className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Centro de Ayuda</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Encuentra respuestas a tus preguntas y soporte técnico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
