import type { Meta, StoryObj } from "@storybook/nextjs";
import { Text } from "./Text";

const meta = {
  title: "UI/Input/Text",
  component: Text,
  args: {
    label: "Email Address",
    placeholder: "name@atelier.com",
    value: "",
    onChange: () => undefined,
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithHelperText: Story = {
  args: {
    helperText: "Use your work email for team sync.",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Invalid Entry",
    value: "-42,000.00",
    error: "Email is required",
  },
};

export const WithEndAdornment: Story = {
  args: {
    label: "Email Address",
    type: "email",
    placeholder: "name@atelier.com",
    endAdornment: (
      <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 3.5a6.5 6.5 0 1 0 4.9 10.77.75.75 0 1 0-1.12-.99A5 5 0 1 1 15 10v.5a1.5 1.5 0 1 1-3 0V10a2.5 2.5 0 1 0-2.5 2.5c.62 0 1.2-.23 1.65-.62A3 3 0 0 0 16.5 10V9.9A6.5 6.5 0 0 0 10 3.5Zm-2.5 6.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
        />
      </svg>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "readonly@lushledger.com",
  },
};

export const Required: Story = {
  args: {
    label: "Email Address",
    isRequired: true,
    placeholder: "name@atelier.com",
  },
};
