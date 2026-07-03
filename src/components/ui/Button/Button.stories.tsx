import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./Button";

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden="true" fill="none">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden="true" fill="none">
      <path d="M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 6l5 4-5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden="true" fill="none">
      <path d="M4 14.5V16h1.5l8.2-8.2-1.5-1.5L4 14.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11.7 6.3l1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Primary Action",
    variant: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "error", "success", "tertiary"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large", "extralarge"],
    },
    isIconOnly: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Destructive: Story = {
  args: {
    variant: "error",
    children: "Delete Entry",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
      <Button size="extralarge">Extra Large</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    leftIcon: <PlusIcon />,
    rightIcon: <ArrowRightIcon />,
    children: "New Entry",
  },
};

export const IconOnly: Story = {
  args: {
    isIconOnly: true,
    size: "medium",
    variant: "secondary",
    "aria-label": "Edit",
    children: <EditIcon />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
