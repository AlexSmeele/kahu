import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ScenarioChoice {
  id: string;
  text: string;
  nextNode: string;
  isOptimal?: boolean;
}

interface ScenarioNode {
  id: string;
  title: string;
  description: string;
  choices: ScenarioChoice[];
  feedback?: string;
  isEnd?: boolean;
}

const scenarioData: Record<string, ScenarioNode> = {
  start: {
    id: 'start',
    title: 'Meeting a Dog at the Shelter',
    description: 'You arrive at the shelter to meet Max, a 2-year-old mixed breed. The staff member brings Max into the meeting room. He seems a bit nervous, with his tail low and ears back. What do you do first?',
    choices: [
      { id: 'a', text: 'Rush over and pet him immediately to show you\'re friendly', nextNode: 'rushed' },
      { id: 'b', text: 'Sit calmly and let him approach you at his own pace', nextNode: 'patient', isOptimal: true },
      { id: 'c', text: 'Call him over loudly to get his attention', nextNode: 'loud' },
      { id: 'd', text: 'Offer your hand for him to sniff first', nextNode: 'hand' },
    ],
  },
  rushed: {
    id: 'rushed',
    title: 'Too Fast',
    description: 'Max backs away and becomes more anxious. Moving too quickly can overwhelm a nervous dog. The staff member suggests giving him more space.',
    feedback: 'Rushing toward a nervous dog can increase their anxiety. It\'s important to let them set the pace of interaction.',
    choices: [
      { id: 'a', text: 'Step back and sit down quietly', nextNode: 'patient', isOptimal: true },
      { id: 'b', text: 'Keep trying to approach him', nextNode: 'persistent' },
    ],
  },
  loud: {
    id: 'loud',
    title: 'Startled',
    description: 'Max flinches at the sudden loud noise. He moves to the far corner of the room. Loud sounds can be scary for anxious dogs.',
    feedback: 'Use a calm, gentle voice when meeting nervous dogs. Sudden loud noises can increase their fear.',
    choices: [
      { id: 'a', text: 'Speak softly and sit down', nextNode: 'patient', isOptimal: true },
      { id: 'b', text: 'Stay standing and keep calling', nextNode: 'persistent' },
    ],
  },
  hand: {
    id: 'hand',
    title: 'Hand Sniff',
    description: 'Max cautiously sniffs your hand but still seems unsure. This is a good start, but he needs more time.',
    feedback: 'Letting a dog sniff your hand is good, but avoid looming over them. Sitting or crouching is less threatening.',
    choices: [
      { id: 'a', text: 'Sit down and continue to let him investigate', nextNode: 'patient', isOptimal: true },
      { id: 'b', text: 'Try to pet him now', nextNode: 'tooSoon' },
    ],
  },
  patient: {
    id: 'patient',
    title: 'Building Trust',
    description: 'You sit calmly on the floor, looking away slightly to be less threatening. After a minute, Max\'s tail lifts a bit and he takes a few steps toward you. What do you do?',
    feedback: 'Excellent! Staying calm and patient allows the dog to feel safe and approach on their own terms.',
    choices: [
      { id: 'a', text: 'Stay still and let him come closer', nextNode: 'success', isOptimal: true },
      { id: 'b', text: 'Reach out to pet him', nextNode: 'tooSoon' },
      { id: 'c', text: 'Offer him a treat', nextNode: 'treat' },
    ],
  },
  treat: {
    id: 'treat',
    title: 'Treat Time',
    description: 'You gently toss a treat near Max. He sniffs it, takes it, and his body language relaxes. He starts to wag his tail slightly and moves closer.',
    feedback: 'Great thinking! Treats can help build positive associations. Tossing it rather than hand-feeding gives him space.',
    choices: [
      { id: 'a', text: 'Continue being patient as he gains confidence', nextNode: 'success', isOptimal: true },
    ],
  },
  tooSoon: {
    id: 'tooSoon',
    title: 'Moved Too Fast',
    description: 'Max backs away again. He wasn\'t quite ready for direct contact yet.',
    feedback: 'Even when a dog approaches, wait for clear signs they\'re comfortable before touching them.',
    choices: [
      { id: 'a', text: 'Give him more space', nextNode: 'patient', isOptimal: true },
    ],
  },
  persistent: {
    id: 'persistent',
    title: 'Pushing Too Hard',
    description: 'Max shows signs of stress - yawning, licking lips, and avoiding eye contact. The staff member suggests ending the session and trying again another time.',
    feedback: 'Persisting when a dog shows stress signals can damage the relationship. Always respect their boundaries.',
    choices: [],
    isEnd: true,
  },
  success: {
    id: 'success',
    title: 'Success!',
    description: 'Max approaches you fully, sniffs you thoroughly, and allows gentle pets. His tail is wagging and he even brings you a toy! The staff member is impressed with your patience and understanding of dog body language.',
    feedback: 'Perfect! You successfully built trust by respecting Max\'s pace, reading his body language, and staying calm. These are essential skills for any dog owner.',
    choices: [],
    isEnd: true,
  },
};

export function ScenarioEngine() {
  const [currentNode, setCurrentNode] = useState('start');
  const [history, setHistory] = useState<string[]>(['start']);
  const [completedOptimal, setCompletedOptimal] = useState(false);

  const node = scenarioData[currentNode];
  const progress = (history.length / Object.keys(scenarioData).length) * 100;

  const handleChoice = (choice: ScenarioChoice) => {
    setHistory([...history, choice.nextNode]);
    setCurrentNode(choice.nextNode);
    
    if (scenarioData[choice.nextNode].isEnd && choice.nextNode === 'success') {
      setCompletedOptimal(true);
    }
  };

  const handleRestart = () => {
    setCurrentNode('start');
    setHistory(['start']);
    setCompletedOptimal(false);
  };

  const canGoBack = history.length > 1 && !node.isEnd;

  const handleBack = () => {
    if (canGoBack) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentNode(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xl">Interactive Scenario</h3>
          <span className="text-sm text-muted-foreground">
            Step {history.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-6">
        {/* Current Scenario */}
        <div className="p-6 rounded-lg bg-muted/30 border">
          <h4 className="font-bold text-lg mb-3">{node.title}</h4>
          <p className="text-sm leading-relaxed">{node.description}</p>
        </div>

        {/* Feedback */}
        {node.feedback && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{node.feedback}</p>
            </div>
          </div>
        )}

        {/* Choices */}
        {node.choices.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">What do you do?</p>
            {node.choices.map(choice => (
              <Button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 px-4"
              >
                <span className="flex-1">{choice.text}</span>
                {choice.isOptimal && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Optimal
                  </span>
                )}
              </Button>
            ))}
          </div>
        )}

        {/* End State Actions */}
        {node.isEnd && (
          <div className="space-y-3">
            {completedOptimal ? (
              <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-lg mb-2">Excellent Work!</h4>
                <p className="text-sm text-muted-foreground">
                  You made optimal choices and successfully built trust with Max. 
                  These skills will serve you well as a dog owner.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <h4 className="font-bold text-lg mb-2">Learning Moment</h4>
                <p className="text-sm text-muted-foreground">
                  This is a valuable learning experience. Understanding dog body language 
                  and respecting their pace is crucial. Try again with what you've learned!
                </p>
              </div>
            )}

            <Button onClick={handleRestart} className="w-full">
              Start New Scenario
            </Button>
          </div>
        )}

        {/* Navigation */}
        {!node.isEnd && history.length > 1 && (
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}

        {/* Progress Info */}
        <div className="text-center text-xs text-muted-foreground">
          This scenario teaches you to read dog body language and respect their boundaries
        </div>
      </div>
    </Card>
  );
}
