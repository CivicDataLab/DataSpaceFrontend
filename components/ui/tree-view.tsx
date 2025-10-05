import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreeDataItem {
  id: string
  name: string
  children?: TreeDataItem[]
  [key: string]: any
}

interface TreeViewProps {
  data: TreeDataItem[]
  selectedItems?: string[]
  onSelectChange?: (items: string[]) => void
  expandedItems?: string[]
  onExpandedChange?: (items: string[]) => void
  className?: string
}

interface TreeItemProps {
  item: TreeDataItem
  level: number
  selectedItems: string[]
  expandedItems: string[]
  onSelectChange: (items: string[]) => void
  onExpandedChange: (items: string[]) => void
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  selectedItems,
  expandedItems,
  onSelectChange,
  onExpandedChange,
}) => {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.includes(item.id)
  const isSelected = selectedItems.includes(item.id)

  const handleToggle = () => {
    if (hasChildren) {
      if (isExpanded) {
        onExpandedChange(expandedItems.filter((id) => id !== item.id))
      } else {
        onExpandedChange([...expandedItems, item.id])
      }
    }
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (isSelected) {
      onSelectChange(selectedItems.filter((id) => id !== item.id))
    } else {
      onSelectChange([...selectedItems, item.id])
    }
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1.5 py-1 px-1 rounded hover:bg-gray-50 transition-colors cursor-pointer",
          isSelected && "bg-gray-100"
        )}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <div className="flex items-center gap-1 flex-1">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="p-0.5 h-4 w-4 shrink-0 flex items-center justify-center hover:bg-gray-200 rounded"
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 transition-transform text-gray-600",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="h-3.5 w-3.5 rounded border-gray-300 cursor-pointer shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          
          <span
            onClick={handleToggle}
            className={cn(
              "flex-1 text-xs leading-tight",
              level === 0 ? "font-medium text-gray-900" : "font-normal text-gray-700"
            )}
          >
            {item.name}
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedItems={selectedItems}
              expandedItems={expandedItems}
              onSelectChange={onSelectChange}
              onExpandedChange={onExpandedChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  selectedItems = [],
  onSelectChange = () => {},
  expandedItems = [],
  onExpandedChange = () => {},
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {data.map((item) => (
        <TreeItem
          key={item.id}
          item={item}
          level={0}
          selectedItems={selectedItems}
          expandedItems={expandedItems}
          onSelectChange={onSelectChange}
          onExpandedChange={onExpandedChange}
        />
      ))}
    </div>
  )
}
