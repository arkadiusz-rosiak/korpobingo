import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import Button from "./Button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Simple: Story = {
  render: () => (
    <Card>
      <CardBody>
        <p className="text-gray-600">A simple card with just body content.</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Round Settings</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600">Configure your bingo round before starting the game.</p>
      </CardBody>
      <CardFooter>
        <Button variant="primary" size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};
