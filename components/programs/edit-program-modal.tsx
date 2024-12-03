'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { programFormSchema, ProgramFormValues } from "./program-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Switch } from '../ui/switch'
import { Program } from '@/app/admin/program-management/page'

interface EditProgramModalProps {
  program: Program;
  onSubmit: (programId: string, programData: ProgramFormValues) => Promise<void>;
}

export function EditProgramModal({ program, onSubmit }: EditProgramModalProps) {
  const [open, setOpen] = React.useState(false)
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: program.name,
      level: program.level as "bachelors" | "masters" | "phd",
      duration: program.duration,
      tuitionFee: program.tuitionFee,
      currency: program.currency as "USD" | "EUR" | "GBP",
      country: program.country,
      description: program.description || '',
      eligibilityCriteria: program.eligibilityCriteria || {
        academic: {
          minimumEducationLevel: {
            level: '',
            requiredStream: [],
            specificMajors: []
          },
          minimumGPA: {
            score: null,
            maxScale: null,
            convertedPercentage: null
          },
          requiredSubjects: []
        },
        language: {
          acceptedTests: {
            IELTS: {
              overallScore: null,
              minimumScores: {
                reading: null,
                writing: null,
                speaking: null,
                listening: null
              }
            }
          }
        }
      }
    }
  });

  const handleSubmit = async (data: ProgramFormValues) => {
    try {
      await onSubmit(program.id, data);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to update program:', error);
    }
  }

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit, onError)} className="space-y-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={form.watch("level")}
                  onValueChange={(value) => form.setValue("level", value as "bachelors" | "masters" | "phd")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">{`Bachelor's`}</SelectItem>
                    <SelectItem value="masters">{`Master's`}</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  {...form.register("duration")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tuitionFee"
                    type="number"
                    {...form.register("tuitionFee", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                  />
                  <Select
                    value={form.watch("currency")}
                    onValueChange={(value) => form.setValue("currency", value as "USD" | "EUR" | "GBP")}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
              />
            </div>

            {/* Academic Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Requirements</h3>
              
              {/* Minimum Education Level */}
              <div className="space-y-2">
                <Label>Minimum Education Level</Label>
                <Input
                  {...form.register("eligibilityCriteria.academic.minimumEducationLevel.level")}
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>

              {/* Minimum GPA */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>GPA Score</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.score", {
                      setValueAs: (v: string) => v === "" ? null : parseFloat(v)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Scale</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.maxScale", {
                      setValueAs: (v: string) => v === "" ? null : parseFloat(v)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.convertedPercentage", {
                      setValueAs: (v: string) => v === "" ? null : parseFloat(v)
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Professional Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Requirements</h3>
              
              {/* Work Experience */}
              <div className="space-y-2">
                <Label>Work Experience</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Years Required</Label>
                    <Input
                      type="number"
                      {...form.register("eligibilityCriteria.professional.workExperience.yearsRequired", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Is Compulsory</Label>
                      <Switch 
                        checked={form.watch("eligibilityCriteria.professional.workExperience.isCompulsory") ?? false}
                        onCheckedChange={(checked: boolean) => 
                          form.setValue("eligibilityCriteria.professional.workExperience.isCompulsory", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Required Certifications</Label>
                <Input
                  placeholder="Add certification requirements"
                  {...form.register("eligibilityCriteria.professional.certifications.0.name")}
                />
              </div>
            </div>

            {/* Language Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Language Requirements</h3>
              
              {/* IELTS Scores */}
              <div className="space-y-4">
                <Label>IELTS Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Overall Score</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.overallScore", {
                        setValueAs: (v) => (v === "" ? null : parseFloat(v))
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reading</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.reading", {
                        setValueAs: (v) => (v === "" ? null : parseFloat(v))
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Writing</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.writing", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Speaking</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.speaking", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Listening</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.listening", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Standardized Tests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Standardized Tests</h3>
              
              {/* GRE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>GRE Required</Label>
                  <Switch 
                    checked={form.watch("eligibilityCriteria.standardizedTests.GRE.required") ?? false}
                    onCheckedChange={(checked) => 
                      form.setValue("eligibilityCriteria.standardizedTests.GRE.required", checked)
                    }
                  />
                </div>
                
                {form.watch("eligibilityCriteria.standardizedTests.GRE.required") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Verbal Score</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.standardizedTests.GRE.minimumScores.verbal", {
                          setValueAs: (v) => (v === "" ? null : parseFloat(v))
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantitative Score</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.standardizedTests.GRE.minimumScores.quantitative", {
                          setValueAs: (v) => (v === "" ? null : parseFloat(v))
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Analytical Writing</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...form.register("eligibilityCriteria.standardizedTests.GRE.minimumScores.analyticalWriting", {
                          setValueAs: (v) => (v === "" ? null : parseFloat(v))
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* GMAT */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>GMAT Required</Label>
                  <Switch 
                    checked={form.watch("eligibilityCriteria.standardizedTests.GMAT.required") ?? false}
                    onCheckedChange={(checked) => 
                      form.setValue("eligibilityCriteria.standardizedTests.GMAT.required", checked)
                    }
                  />
                </div>
                
                {form.watch("eligibilityCriteria.standardizedTests.GMAT.required") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Score</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.standardizedTests.GMAT.minimumScores.total", {
                          setValueAs: (v) => (v === "" ? null : parseFloat(v))
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantitative Score</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.standardizedTests.GMAT.minimumScores.quantitative", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Verbal Score</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.standardizedTests.GMAT.minimumScores.verbal", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Requirements</h3>
              
              {/* Financial Requirements */}
              <div className="space-y-4">
                <Label>Financial Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Amount</Label>
                    <Input
                      type="number"
                      {...form.register("eligibilityCriteria.additional.financialRequirements.minimumAmount", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={form.watch("eligibilityCriteria.additional.financialRequirements.currency") ?? undefined}
                      onValueChange={(value: string) => 
                        form.setValue("eligibilityCriteria.additional.financialRequirements.currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Recommendation Letters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Recommendation Letters Required</Label>
                  <Switch 
                    checked={form.watch("eligibilityCriteria.additional.recommendationLetters.required") ?? false}
                    onCheckedChange={(checked: boolean) => 
                      form.setValue("eligibilityCriteria.additional.recommendationLetters.required", checked)
                    }
                  />
                </div>
                
                {form.watch("eligibilityCriteria.additional.recommendationLetters.required") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Letters</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.additional.recommendationLetters.academic", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Professional Letters</Label>
                      <Input
                        type="number"
                        {...form.register("eligibilityCriteria.additional.recommendationLetters.professional", { setValueAs: (v) => (v === "" ? null : parseFloat(v)) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Special Conditions</h3>
              
              {/* Country Specific Requirements */}
              <div className="space-y-2">
                <Label>Country Specific Requirements</Label>
                <Textarea
                  placeholder="Enter any country-specific requirements..."
                  {...form.register("eligibilityCriteria.specialConditions.countrySpecificRequirements.0.additionalDocuments")}
                />
              </div>

              {/* Scholarship Eligibility */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Scholarship Available</Label>
                  <Switch 
                    checked={form.watch("eligibilityCriteria.specialConditions.scholarshipEligibility.0.available") ?? false}
                    onCheckedChange={(checked) => 
                      form.setValue("eligibilityCriteria.specialConditions.scholarshipEligibility.0.available", checked)
                    }
                  />
                </div>
                
                {form.watch("eligibilityCriteria.specialConditions.scholarshipEligibility.0.available") && (
                  <div className="space-y-2">
                    <Label>Scholarship Criteria</Label>
                    <Textarea
                      placeholder="Enter scholarship eligibility criteria..."
                      {...form.register("eligibilityCriteria.specialConditions.scholarshipEligibility.0.criteria")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Program</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
