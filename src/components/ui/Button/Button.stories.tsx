import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Primary Action",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Outline",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete Entry",
  },
};

export const Xs: Story = {
  args: {
    size: "xs",
    children: "XS Button",
  },
};

export const Xm: Story = {
  args: {
    size: "xm",
    children: "XM Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "New Entry",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
