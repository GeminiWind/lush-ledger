import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Switch } from "./Switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  args: {
    checked: false,
    disabled: false,
    "aria-label": "Toggle primary mode",
    onCheckedChange: () => undefined,
  },
  argTypes: {
    onCheckedChange: { action: "checkedChange" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveSwitch(args: React.ComponentProps<typeof Switch>) {
  const [checked, setChecked] = React.useState(Boolean(args.checked));

  return (
    <div className="flex items-center gap-[var(--spacing-3)]">
      <Switch
        {...args}
        checked={checked}
        onCheckedChange={(nextChecked) => {
          setChecked(nextChecked);
          args.onCheckedChange?.(nextChecked);
        }}
      />
      <span className="text-[length:var(--font-label-md)] text-[var(--color-on-surface)]">
        {checked ? "On" : "Off"}
      </span>
    </div>
  );
}

export const Default: Story = {
  args: {},
  render: (args) => <InteractiveSwitch {...args} />,
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => <InteractiveSwitch {...args} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <InteractiveSwitch {...args} />,
};
