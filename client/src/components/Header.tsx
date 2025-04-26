import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { Sun, Moon, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { 
    backgroundRotation, 
    selectedCategory, 
    setBackgroundRotation, 
    refreshBackground 
  } = useAppStore();

  useEffect(() => {
    // Set dark mode in app store based on theme
    const darkMode = theme === 'dark';
    useAppStore.getState().setDarkMode(darkMode);
  }, [theme]);

  return (
    <header className="w-full pt-6 pb-2 px-4 flex justify-between items-center">
      <div className="text-3xl font-bold text-white drop-shadow-lg">Serene Start</div>
      
      <div className="flex space-x-4 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-white rounded-full hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Background Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('daily')}
              className={backgroundRotation === 'daily' ? "bg-primary/10" : ""}
            >
              Change Daily
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('hourly')}
              className={backgroundRotation === 'hourly' ? "bg-primary/10" : ""}
            >
              Change Hourly
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('random')}
              className={backgroundRotation === 'random' ? "bg-primary/10" : ""}
            >
              Random
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Categorized Backgrounds</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('category', 'landscape')}
              className={backgroundRotation === 'category' && selectedCategory === 'landscape' ? "bg-primary/10" : ""}
            >
              Landscapes
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('category', 'forest')}
              className={backgroundRotation === 'category' && selectedCategory === 'forest' ? "bg-primary/10" : ""}
            >
              Forests
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('category', 'ocean')}
              className={backgroundRotation === 'category' && selectedCategory === 'ocean' ? "bg-primary/10" : ""}
            >
              Ocean
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setBackgroundRotation('category', 'mountain')}
              className={backgroundRotation === 'category' && selectedCategory === 'mountain' ? "bg-primary/10" : ""}
            >
              Mountains
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={refreshBackground}>
              Refresh Background
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
