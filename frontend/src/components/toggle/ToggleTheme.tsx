import { useTheme } from "../../hooks/useTheme";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import DefaultContainer from "../ui/DefaultContainer";

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DefaultContainer
      className="scale-75 origin-center cursor-pointer"
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <AnimatedThemeToggler className="cursor-pointer" />
    </DefaultContainer>
  );
};

export default ToggleTheme;
