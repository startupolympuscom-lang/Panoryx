"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select, Label } from "@/components/ui/form-fields";
import { ErrorAlert } from "@/components/ui/form-status";
import { submitContactRequest, submitDemoRequest, type FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

const productOptions = [
  { value: "panostation", label: "PanoStation" },
  { value: "autre", label: "Autre / je ne sais pas encore" },
];

export function ContactForm({ variant = "contact" }: { variant?: "contact" | "demo" }) {
  const action = variant === "demo" ? submitDemoRequest : submitContactRequest;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <AnimatePresence mode="wait">
      {state.status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-lg border border-navy-100 bg-white p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
          >
            <CheckCircle2 size={24} aria-hidden="true" />
          </motion.div>
          <h3 className="mt-4 text-lg font-semibold text-navy">Demande envoyée</h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            Merci, votre message a bien été transmis à notre équipe. Nous revenons vers vous très
            prochainement.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          action={formAction}
          className="space-y-5"
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Honeypot — hidden from real users, tripped by bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Site web</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nom complet" htmlFor="fullName" error={state.fieldErrors?.fullName}>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </Field>
            <Field label="Entreprise" htmlFor="companyName" error={state.fieldErrors?.companyName}>
              <Input id="companyName" name="companyName" autoComplete="organization" required />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="E-mail professionnel"
              htmlFor="professionalEmail"
              error={state.fieldErrors?.professionalEmail}
            >
              <Input
                id="professionalEmail"
                name="professionalEmail"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Téléphone" htmlFor="phone" error={state.fieldErrors?.phone} hint="Facultatif">
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Nombre de sites / stations"
              htmlFor="sitesCount"
              error={state.fieldErrors?.sitesCount}
              hint="Facultatif"
            >
              <Input id="sitesCount" name="sitesCount" type="number" min={0} inputMode="numeric" />
            </Field>
            <div>
              <Label htmlFor="productInterest">Produit qui vous intéresse</Label>
              <Select id="productInterest" name="productInterest" defaultValue="panostation">
                {productOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Field
            label={variant === "demo" ? "Précisions sur votre besoin (facultatif)" : "Votre message"}
            htmlFor="message"
            error={state.fieldErrors?.message}
          >
            <Textarea
              id="message"
              name="message"
              rows={5}
              required={variant === "contact"}
              placeholder="Parlez-nous de votre réseau, de vos sites, de vos besoins…"
            />
          </Field>

          <div className="flex items-start gap-3">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-navy-300 text-panoryx-blue focus:ring-panoryx-blue/30"
              required
            />
            <label htmlFor="consent" className="text-sm leading-relaxed text-navy-500">
              J&apos;accepte d&apos;être contacté(e) par l&apos;équipe Panoryx au sujet de ma
              demande.
            </label>
          </div>
          {state.fieldErrors?.consent ? (
            <p className="text-xs font-medium text-action-coral">{state.fieldErrors.consent}</p>
          ) : null}

          {state.status === "error" && state.message ? <ErrorAlert>{state.message}</ErrorAlert> : null}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Envoi en cours…" : variant === "demo" ? "Demander une démo" : "Envoyer le message"}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
