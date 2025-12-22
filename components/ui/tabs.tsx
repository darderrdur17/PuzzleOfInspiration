import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {}
})

const Tabs: React.FC<TabsProps> = ({ defaultValue = "", value: controlledValue, onValueChange, children }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue ?? internalValue
  const handleValueChange = (newValue: string) => {
    if (!controlledValue) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className="space-y-2">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList: React.FC<TabsListProps> = ({ children, className, ...props }) => (
  <div
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600", className)}
    {...props}
  >
    {children}
  </div>
)

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value: tabValue, children, className, ...props }) => {
  const { value, onValueChange } = React.useContext(TabsContext)
  const isActive = value === tabValue

  return (
    <button
      onClick={() => onValueChange(tabValue)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent: React.FC<TabsContentProps> = ({ value: contentValue, children, className, ...props }) => {
  const { value } = React.useContext(TabsContext)

  if (value !== contentValue) {
    return null
  }

  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
