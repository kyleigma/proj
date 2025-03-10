import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const getCurrentIcon = () => {
        return theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {getCurrentIcon()}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}