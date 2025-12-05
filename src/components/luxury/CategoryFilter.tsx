import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = ({ categories, selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Button
          variant={selected === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect("All")}
          className={selected === "All" 
            ? "bg-primary text-primary-foreground" 
            : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50"
          }
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category)}
            className={selected === category 
              ? "bg-primary text-primary-foreground" 
              : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50"
            }
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
