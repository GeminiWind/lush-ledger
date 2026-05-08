import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "UI/Input/Checkbox",
  component: Checkbox,
  args: {
    label: "Set as primary account",
    checked: false,
    disabled: false,
    onCheckedChange: () => undefined,
  },
  argTypes: {
    onCheckedChange: { action: "checkedChanged" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveTemplate = (args: Story["args"]) => {
  const [checked, setChecked] = useState(Boolean(args?.checked));

  return (
    <Checkbox
      {...args}
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        args?.onCheckedChange?.(next);
      }}
    />
  );
};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
  render: (args) => InteractiveTemplate(args),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => InteractiveTemplate(args),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: "Accept terms",
    isRequired: true,
    checked: false,
  },
  render: (args) => InteractiveTemplate(args),
};

export const WithHelperText: Story = {
  args: {
    helperText: "This sets your default preference.",
  },
};

export const WithError: Story = {
  args: {
    error: "You must accept terms before continuing.",
  },
};
