"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestReceivedTable } from "./request-received-table"
import { RequestSentTable } from "./request-sent-table"

interface RequestTabsProps {
  requestsReceived: any[]
  requestsSent: any[]
}

export function RequestTabs({ requestsReceived, requestsSent }: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState("received")

  return (
    <div className="rounded-lg border bg-white">
      <Tabs defaultValue="received" onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="received"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Request Received ({requestsReceived.length})
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              Request Sent ({requestsSent.length})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="received" className="p-0">
          <RequestReceivedTable requests={requestsReceived} />
        </TabsContent>
        <TabsContent value="sent" className="p-0">
          <RequestSentTable requests={requestsSent} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
