"use client"

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Shield, AlertCircle, CheckCircle } from "lucide-react";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });

  // @ts-ignore
  const [error, setErrors] = useState<FieldErrors>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const params = useParams();
  const router = useRouter();
  const rawLocale = (params as Record<string, string | string[]>)?.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale || "it";

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  }

  const isStrongPassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    )
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type, checked} = e.target;

    const nextValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (error[name]) {
      setErrors((prev) => ({...prev, [name]: ""}))
    }
    if (error.general) {
      setErrors((prev) => ({...prev, general: ""}))
    }
  };

  const validateForm = () => {
    const newErrors: FieldErrors = {}

    // Nome
    const firstName = form.firstName.trim()
    if (!firstName) newErrors.firstName = "Il nome è obbligatorio"
    else if (firstName.length < 2) newErrors.firstName = "Il nome deve contenere almeno 2 caratteri"

    // Cognome
    const lastName = form.lastName.trim()
    if (!lastName) newErrors.lastName = "Il cognome è obbligatorio"
    else if (lastName.length < 2) newErrors.lastName = "Il cognome deve contenere almeno 2 caratteri"

    // Email
    const email = form.email.trim().toLowerCase()
    if (!email) newErrors.email = "L'email è obbligatoria"
    else if (!isValidEmail(email)) newErrors.email = "Inserisci un indirizzo email valido"

    // Password
    if (!form.password) newErrors.password = "La password è obbligatoria"
    else if (!isStrongPassword(form.password)) {
      newErrors.password = "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero\""
    }

    // Conferma password
    if (!form.confirmPassword) newErrors.confirmPassword = "Conferma la password"
    else if (form.password != form.confirmPassword) newErrors.confirmPassword = "Le password non corrispondono"

    // Consensi obbligatori
    if (!form.acceptTerms) newErrors.acceptTerms = "Devi accettare i Termini e Condizioni"
    if (!form.acceptTerms) newErrors.acceptPrivacy = "Devi accettare l'informativa sulla privacy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validateForm()) return

    setIsLoading(true);
    setErrors({})

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        // Quando estendiamo API backend per i consensi aggiungiamo
        // gdprConsent: form.acceptTerms && form.acceptPrivacy,
        // gdprConsentDate: new Date().toISOString(),
        // marketingConsent: form.acceptMarketing,
        // marketingConsentDate: form.acceptMarketing ? new Date().toISOString() : undefined,
      }

      const res = await fetch(`/${locale}/api/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const nextErrors: FieldErrors = {}
        if (Array.isArray(data?.details)) {
          for (const d of data.details) {
            if (d?.field && d?.message) nextErrors[d.field] = d.message
          }
        }

        if (data?.error && !Object.keys(nextErrors).length) {
          nextErrors.general = data.error
        }
        if(!Object.keys(nextErrors).length) {
          nextErrors.general = "Errore durante la registrazione"
        }
        setErrors(nextErrors)
        return
      }

      // Successo: abbiamo creato sessione + cookie, facciamo redirect alla home
      router.push(`/${locale}`)

    } catch (error) {
      setErrors({ general: "Errore di connessione. Riprova più tardi." });
    } finally {
      setIsLoading(false);
    }
  };


  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Debole";
    if (passwordStrength <= 3) return "Media";
    return "Forte";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Crea il tuo account
            </h1>
          <p className="text-gray-600">
            Unisciti alla famiglia DryCat
          </p>
        </div>

        {/* Errore Generale */}
        {error.general && (
          <div className="mb-6 p-4 bg-red-50 border-red-200 rounded-b-lg flex items-center gap-2" role="alert">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Nome e Cognome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    error.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nome"
                  required
                  autoComplete="given-name"
                  aria-invalid={Boolean(error.firstName)}
                  aria-describedby={error.firstName ? "firstName-error" : undefined}
                />
              </div>
              {error.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600">
                  {error.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Cognome *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    error.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Cognome"
                  required
                  autoComplete="family-name"
                  aria-invalid={Boolean(error.lastName)}
                  aria-describedby={error.lastName ? "lastName-error" : undefined}
                />
              </div>
              {error.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600">
                  {error.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  error.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="mario.rossi@email.com"
                required
                autoComplete="email"
                aria-invalid={Boolean(error.email)}
                aria-describedby={error.email ? "email-error" : undefined}
              />
            </div>
            {error.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {error.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  error.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-invalid={Boolean(error.password)}
                aria-describedby={error.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Barra forza password (solo UX) */}
            {form.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                         style={{ width: `${(passwordStrength / 5) * 100}%`}}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                </div>
                <p id="password-help" className="text-xs text-gray-500">
                  Usa almeno 8 caratteri con lettere maiuscole, minuscole e numeri
                </p>
              </div>
            )}
            {error.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {error.password}
              </p>
            )}
          </div>

          {/* Conferma password */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Conferma Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  error.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-invalid={Boolean(error.confirmPassword)}
                aria-describedby={error.confirmPassword ? "confirmPassword-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Nascondi conferma password" : "Mostra conferma password"}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {form.confirmPassword && form.password === form.confirmPassword && (
              <div className="mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Le password corrispondono</span>
              </div>
            )}
            {error.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                {error.confirmPassword}
              </p>
            )}
          </div>

          {/* Consensi GDPR (client-side) */}
          <div className="space-y-4">
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  Accetto i{" "}
                  <a
                    href={"/"}
                    className="text-indigo-600 hover:text-indigo-800 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Termini e Condizioni
                  </a>{" "}
                  del servizio *
                </span>
              </label>
              {error.acceptTerms && (
                <p className="mt-1 text-sm text-red-600 ml-7">{error.acceptTerms}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={form.acceptPrivacy}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  Ho letto e accetto l&#39;{" "}
                  <a
                    href={`/`}
                    className="text-indigo-600 hover:text-indigo-800 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Informativa sulla Privacy
                  </a>{" "}
                  (GDPR) *
                </span>
              </label>
              {error.acceptPrivacy && (
                <p className="mt-1 text-sm text-red-600 ml-7">{error.acceptPrivacy}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptMarketing"
                  checked={form.acceptMarketing}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  Acconsento al trattamento dei dati per finalità di marketing (opzionale)
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrazione...
                </div>
              ) : (
                "Crea Account"
              )}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hai già un account?{" "}
            <a
              href={`/${locale}/login`}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Accedi qui
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              I tuoi dati sono protetti con crittografia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
