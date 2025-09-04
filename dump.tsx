<Tabs
    defaultValue="console"
    onValueChange={(value) => setActiveTabct(value as "instructions" | "code")}
    className="w-full px-3 sm:px-4">
    {/* Tab Navigation */}
    <div className="w-full flex justify-center items-center">
        <TabsList className="grid w-full grid-cols-2 mb-8 gap-1 sm:max-w-[24rem]">
            <TabsTrigger value="console">Instructions</TabsTrigger>
            <TabsTrigger value="test">Code</TabsTrigger>
        </TabsList>
    </div>

    {/* Instructions Tab */}
    <TabsContent value="console" className="space-y-6 min-h-[70vh] sm:min-h-[60vh] md:max-w-7xl m-auto">
        {/* Output */}
        <div className="border-border border rounded-sm p-2 md:p-4">
            {output ? (
                <div className="space-y-2 h-full">
                    <div className="bg-muted border border-border min-h-full p-3 sm:p-4 max-h-64 sm:max-h-80 overflow-y-auto">
                        <pre className="text-base whitespace-pre-wrap font-mono break-words">
                            {output}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 min-h-full bg-muted flex justify-center items-center">
                    <div className="p-3 sm:p-4 max-h-64 min-h-full overflow-y-auto">
                        <p className="text-base text-center sm:text-sm text-foreground/25">
                            Run Code: <br />You will see test outputs here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </TabsContent>

    {/* Code Tab */}
    <TabsContent
        value="test"
        className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[60vh] max-w-7xl mx-auto"
    >

        {/* Output */}
        <div className="border-border border rounded-sm p-2 md:p-4">
            {output ? (
                <div className="space-y-2 h-full">
                    <div className="bg-muted border border-border min-h-full p-3 sm:p-4 max-h-64 sm:max-h-80 overflow-y-auto">
                        <pre className="text-base whitespace-pre-wrap font-mono break-words">
                            {output}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 min-h-full bg-muted flex justify-center items-center">
                    <div className="p-3 sm:p-4 max-h-64 min-h-full overflow-y-auto">
                        <p className="text-base text-center sm:text-sm text-foreground/25">
                            Run Code: <br />You will see test outputs here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </TabsContent>
</Tabs>