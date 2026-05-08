import type { Meta, StoryObj } from "@storybook/nextjs";
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

export const Unchecked: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
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
  },
};
