import type { Meta, StoryObj } from "@storybook/nextjs";
import { Avatar } from "./Avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  args: {
    initials: "JD",
    alt: "Jane Doe",
    size: "md",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: "sm",
    initials: "AL",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    initials: "LL",
  },
};
