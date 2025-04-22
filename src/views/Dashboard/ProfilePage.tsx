import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0">
          <User className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold">Perfil de Usuario</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí puedes editar tu información personal y preferencias.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
