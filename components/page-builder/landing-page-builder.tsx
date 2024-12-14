'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_SECTIONS = [
  { id: 'hero', label: 'Hero Section', type: 'hero' },
  { id: 'features', label: 'Features', type: 'features' },
  { id: 'howItWorks', label: 'How It Works', type: 'howItWorks' },
  { id: 'testimonials', label: 'Testimonials', type: 'testimonials' },
  { id: 'cta', label: 'Call to Action', type: 'cta' },
];

export function LandingPageBuilder() {
  const [selectedSections, setSelectedSections] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch existing configuration
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/landing-page');
        const data = await response.json();
        if (data.sections) {
          setSelectedSections(data.sections);
          setIsPublished(data.isPublished);
        }
      } catch (error) {
        console.error('Error fetching landing page config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSelectedSections(updatedItems);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: selectedSections,
          isPublished,
        }),
      });

      toast({
        title: "Success",
        description: "Landing page configuration saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save landing page configuration.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSection = (section: any) => {
    const exists = selectedSections.find(s => s.id === section.id);
    
    if (exists) {
      setSelectedSections(prev => prev.filter(s => s.id !== section.id));
    } else {
      setSelectedSections(prev => [...prev, {
        ...section,
        order: prev.length,
        content: {} // Default empty content
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Available Sections</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_SECTIONS.map((section) => (
            <Button
              key={section.id}
              variant={selectedSections.some(s => s.id === section.id) ? "default" : "outline"}
              onClick={() => handleToggleSection(section)}
              className="w-full"
            >
              {section.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Section Order</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {selectedSections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-4 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-between hover:bg-blue-100 transition-colors"
                      >
                        <span>{section.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSection(section)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsPublished(!isPublished)}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
