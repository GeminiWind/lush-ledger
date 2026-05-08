import type { Meta, StoryObj } from "@storybook/nextjs";
import { Typography } from "./Typography";

const meta = {
  title: "UI/Typography",
  component: Typography,
  args: {
    children: "Fiscal Architecture",
    variant: "hero",
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  args: {
    as: "h1",
    variant: "hero",
  },
};

export const PageTitle: Story = {
  args: {
    as: "h1",
    variant: "pageTitle",
    children: "Financial Growth Matrix",
  },
};

export const SectionTitle: Story = {
  args: {
    as: "h2",
    variant: "sectionTitle",
    children: "Monthly Allocation Summary",
  },
};

export const Body: Story = {
  args: {
    as: "p",
    variant: "body",
    children:
      "Transactions are processed using end-to-end encryption protocols ensuring every cent is accounted for.",
  },
};

export const Label: Story = {
  args: {
    as: "span",
    variant: "label",
    children: "Last updated: March 12, 2024 • 08:42 AM",
  },
};

export const Caption: Story = {
  args: {
    as: "span",
    variant: "caption",
    children: "Body / Large",
  },
};

export const NavLabel: Story = {
  args: {
    as: "span",
    variant: "navLabel",
    children: "Atelier",
  },
};
