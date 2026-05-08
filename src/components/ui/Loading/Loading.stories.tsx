import type { Meta, StoryObj } from "@storybook/nextjs";
import { Loading } from "./Loading";

const meta = {
  title: "UI/Loading",
  component: Loading,
  argTypes: {
    label: { control: "text" },
    className: { control: "text" },
  },
  args: {
    label: "Syncing Data...",
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpinnerOnly: Story = {
  args: {},
};

export const CustomLabel: Story = {
  args: {
    label: "Loading portfolio insights...",
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: "rounded-[var(--card-radius)] bg-[var(--card-bg)] p-[var(--spacing-6)]",
  },
};
