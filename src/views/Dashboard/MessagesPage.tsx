import { Card } from "../../components/ui/card"

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <Card className="p-6">
        <p>Messages content goes here</p>
      </Card>
    </div>
  )
}
