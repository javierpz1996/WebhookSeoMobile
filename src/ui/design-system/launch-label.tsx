import { AppleText } from '@/ui/design-system/apple-text';

type LaunchLabelProps = {
  readonly text: string;
};

/** Etiqueta de lanzamiento — texto naranja #B64400, sin pill de color. */
export function LaunchLabel({ text }: LaunchLabelProps) {
  return (
    <AppleText variant="launchLabel" color="launch" accessibilityRole="text">
      {text}
    </AppleText>
  );
}
