/**
 * Flow Engine - Simple utility to manage conversation flows
 * 
 * This handles loading flow data and progressing through conversation steps
 */

export type FlowButton = {
  label: string;
  nextStep: string;
};

export type FlowStep = {
  id: string;
  type: 'ai-message' | 'user-message' | 'human-agent-message' | 'agent-status' | 'disclaimer';
  text: string;
  buttons?: FlowButton[];
  nextStep?: string;
  agentName?: string;
  timestamp?: string;
};

export type Flow = {
  flowId: string;
  title: string;
  steps: FlowStep[];
};

export type FlowMessage = {
  stepId: string;
  type: FlowStep['type'];
  text: string;
  buttons?: FlowButton[];
  agentName?: string;
  timestamp?: string;
};

/**
 * Simple Flow Engine Class
 */
export class FlowEngine {
  private flow: Flow | null = null;
  private currentStepIndex: number = 0;
  private displayedMessages: FlowMessage[] = [];

  /**
   * Load a flow from JSON data
   */
  loadFlow(flowData: Flow) {
    this.flow = flowData;
    this.currentStepIndex = 0;
    this.displayedMessages = [];
    
    // Auto-display the first step
    if (this.flow && this.flow.steps.length > 0) {
      this.displayCurrentStep();
    }
  }

  /**
   * Get all messages displayed so far
   */
  getMessages(): FlowMessage[] {
    return this.displayedMessages;
  }

  /**
   * Display the current step
   */
  private displayCurrentStep() {
    if (!this.flow || this.currentStepIndex >= this.flow.steps.length) {
      return;
    }

    const step = this.flow.steps[this.currentStepIndex];
    
    // Add this step to displayed messages
    this.displayedMessages.push({
      stepId: step.id,
      type: step.type,
      text: step.text,
      buttons: step.buttons,
      agentName: step.agentName,
      timestamp: step.timestamp,
    });

    // If this step has an automatic nextStep (no buttons), show it too
    if (!step.buttons && step.nextStep) {
      this.goToStep(step.nextStep);
    }
  }

  /**
   * Handle when user clicks a button
   */
  handleButtonClick(buttonLabel: string) {
    if (!this.flow) return;

    const currentStep = this.flow.steps[this.currentStepIndex];
    if (!currentStep.buttons) return;

    // Find which button was clicked
    const clickedButton = currentStep.buttons.find(btn => btn.label === buttonLabel);
    if (!clickedButton) return;

    // Go to the next step specified by that button
    this.goToStep(clickedButton.nextStep);
  }

  /**
   * Navigate to a specific step by ID
   */
  private goToStep(stepId: string) {
    if (!this.flow) return;

    // Find the step with this ID
    const stepIndex = this.flow.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    this.currentStepIndex = stepIndex;
    this.displayCurrentStep();
  }

  /**
   * Check if the flow has ended (no more steps)
   */
  isFlowComplete(): boolean {
    if (!this.flow) return true;
    
    const currentStep = this.flow.steps[this.currentStepIndex];
    
    // Flow is complete if we're at the last step and it has no buttons or nextStep
    return (
      this.currentStepIndex === this.flow.steps.length - 1 &&
      !currentStep.buttons &&
      !currentStep.nextStep
    );
  }

  /**
   * Restart the flow from the beginning
   */
  restart() {
    if (!this.flow) return;
    
    this.currentStepIndex = 0;
    this.displayedMessages = [];
    this.displayCurrentStep();
  }
}

