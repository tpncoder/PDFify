import './App.css'

import { Extract } from "@/components/Extract"
import { Merge } from './components/Merge';
import { Split } from './components/Split';
import { Compress } from './components/Compress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function App() {
  return (
    <div id="hero" className="flex min-h-screen items-center justify-center">
      <Tabs defaultValue="merge">
        <TabsList>
          <TabsTrigger value="merge">Merge</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="rotate">Compress</TabsTrigger>
          <TabsTrigger value="extract">Extract text</TabsTrigger>
        </TabsList>

        <TabsContent value="merge"><Merge /></TabsContent>
        <TabsContent value="split"><Split /></TabsContent>
        <TabsContent value="rotate"><Compress /></TabsContent>
        <TabsContent value="extract"><Extract /></TabsContent>
      </Tabs>
    </div>
  )
}

export default App