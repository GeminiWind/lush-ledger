"use client";

import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import type { WalletCreateFormProps } from "@/features/accounts/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export default function WalletCreateForm({ language, currency, wallet, trigger = "primary" }: WalletCreateFormProps) {
  const t = useNamespacedTranslation("wallet", language);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(wallet);
  const currencyAffix = currency === "VND" ? "đ" : currency;
  const queryClient = useQueryClient();

  const openingBalanceDisplay = wallet
    ? formatCurrencyInput(String(Math.max(0, Math.round(wallet.openingBalance))), currency)
    : "";

  const closeModal = () => {
    setOpen(false);
    setError(null);
  };

  const saveWalletMutation = useMutation({
    mutationFn: async (values: { name: string; openingBalance: string; setAsDefault: boolean }) => {
      const payload = {
        name: values.name.trim(),
        openingBalance: parseCurrencyInput(values.openingBalance),
        setAsDefault: values.setAsDefault,
        ...(isEdit ? {} : { type: "cash" }),
      };

      const response = await fetch(isEdit ? `/api/accounts/${wallet!.id}` : "/api/accounts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (isEdit ? t("wallet.walletUpdateFailed") : t("wallet.walletCreateFailed")));
      }
    },
    onSuccess: async () => {
      formik.resetForm();
      closeModal();
      toast.success(isEdit ? t("wallet.walletUpdateSuccess") : t("wallet.walletCreateSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : (isEdit ? t("wallet.walletUpdateFailed") : t("wallet.walletCreateFailed")));
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async () => {
      if (!wallet) {
        return;
      }

      const response = await fetch(`/api/accounts/${wallet.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("wallet.walletDeleteFailed"));
      }
    },
    onSuccess: async () => {
      closeModal();
      toast.success(t("wallet.walletDeleteSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t("wallet.walletDeleteFailed"));
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: wallet?.name || "",
      openingBalance: openingBalanceDisplay,
      setAsDefault: wallet?.isDefault ?? true,
    },
    validate: (values) => {
      const errors: { name?: string; openingBalance?: string } = {};
      if (!values.name.trim()) {
        errors.name = t("wallet.walletNameRequired");
      }
      const balance = parseCurrencyInput(values.openingBalance);
      if (!Number.isFinite(balance) || balance < 0) {
        errors.openingBalance = t("wallet.walletInvalidBalance");
      }
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      saveWalletMutation.mutate(values);
    },
  });

  const openingBalanceSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.openingBalance, currency);
  }, [currency, formik.values.openingBalance]);

  const onDelete = async () => {
    if (!wallet || wallet.isDefault) {
      return;
    }

    setError(null);
    deleteWalletMutation.mutate();
  };

  const openModal = () => {
    setError(null);
    formik.resetForm({
      values: {
        name: wallet?.name || "",
        openingBalance: openingBalanceDisplay,
        setAsDefault: wallet?.isDefault ?? true,
      },
    });
    setOpen(true);
  };

  return (
    <>
      {trigger === "icon" ? (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center rounded-lg bg-white/70 p-2 text-[#49636f] transition-colors hover:text-[#1b3641]"
          aria-label={t("wallet.walletEditAria")}
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#006f1d] px-6 py-3 font-bold text-[#eaffe2] shadow-lg shadow-[#006f1d]/20 hover:brightness-105"
        >
          <span className="material-symbols-outlined">add_card</span>
          <span>{t("wallet.accountsNewWallet")}</span>
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
          onMouseDown={closeModal}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-[#e7f6ff] p-8 shadow-2xl md:p-10"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#006f1d]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#60622d]/10 blur-3xl" />

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white text-[#49636f] hover:bg-[#dcf1fd]"
              aria-label={t("wallet.walletCloseDialog")}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="relative z-10 space-y-8">
              <div className="space-y-2 pr-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#006f1d]">{t("wallet.walletDialogTag")}</p>
                <h2 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
                  {isEdit ? t("wallet.walletDialogEditTitle") : t("wallet.walletDialogTitle")}
                </h2>
                <p className="max-w-xl text-sm text-[#49636f]">{isEdit ? t("wallet.walletDialogEditBody") : t("wallet.walletDialogBody")}</p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1b3641]">
                    {t("wallet.walletDialogNameLabel")} <span className="text-[#a73b21]">*</span>
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t("wallet.walletDialogNamePlaceholder")}
                    className="w-full rounded-2xl border-none bg-white px-5 py-4 text-lg font-medium text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                  />
                  {formik.touched.name && formik.errors.name ? <p className="text-xs text-[#a73b21]">{formik.errors.name}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1b3641]">{t("wallet.walletDialogBalanceLabel")}</label>
                  <div className="relative flex items-center">
                    <input
                      name="openingBalance"
                      value={formik.values.openingBalance}
                      onChange={(event) => {
                        formik.setFieldValue("openingBalance", formatCurrencyInput(event.target.value, currency));
                      }}
                      onBlur={formik.handleBlur}
                      inputMode="numeric"
                      placeholder={t("wallet.walletDialogBalancePlaceholder")}
                      className="w-full rounded-2xl border-none bg-white py-4 pl-5 pr-16 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                    />
                    <span className="pointer-events-none absolute right-5 text-lg font-bold text-[#006f1d]">{currencyAffix}</span>
                  </div>
                  {openingBalanceSuggestions.length ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {openingBalanceSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.value}
                          type="button"
                          onClick={() => formik.setFieldValue("openingBalance", formatCurrencyInput(String(suggestion.value), currency))}
                          className="rounded-full border border-[#cce4ef] bg-[#f5fcff] px-3 py-1 text-xs font-bold text-[#1b3641] transition hover:border-[#8dc4da] hover:bg-[#ebf8ff]"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-[11px] font-medium tracking-wide text-[#49636f]/80">{t("wallet.walletDialogBalanceHint")}</p>
                  {formik.touched.openingBalance && formik.errors.openingBalance ? (
                    <p className="text-xs text-[#a73b21]">{formik.errors.openingBalance}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#006f1d]/10 text-[#006f1d]">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1b3641]">{t("wallet.walletDialogDefaultTitle")}</p>
                      <p className="text-xs text-[#49636f]">{t("wallet.walletDialogDefaultBody")}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => formik.setFieldValue("setAsDefault", !formik.values.setAsDefault)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      formik.values.setAsDefault ? "bg-[#006f1d]" : "bg-[#9bb6c4]"
                    }`}
                    aria-label={t("wallet.walletDialogDefaultTitle")}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formik.values.setAsDefault ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {error ? <div className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-sm text-[#a73b21]">{error}</div> : null}

                <button
                  type="submit"
                  disabled={saveWalletMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#006f1d] to-[#006118] px-6 py-4 text-base font-extrabold text-[#eaffe2] shadow-[0_20px_34px_-18px_rgba(0,111,29,0.6)] hover:brightness-105 disabled:opacity-70"
                >
                  <span>
                    {saveWalletMutation.isPending
                      ? isEdit
                        ? t("wallet.walletDialogUpdating")
                        : t("wallet.walletDialogCreating")
                      : isEdit
                        ? t("wallet.walletDialogUpdateAction")
                        : t("wallet.walletDialogCreateAction")}
                  </span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>

                {isEdit ? (
                  wallet?.isDefault ? (
                    <p className="text-center text-xs font-semibold text-[#6f8793]">{t("wallet.walletDeleteBlockedDefault")}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={deleteWalletMutation.isPending}
                      className="w-full rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-3 text-sm font-bold text-[#a73b21] hover:bg-[#fde9e2] disabled:opacity-70"
                    >
                      {deleteWalletMutation.isPending ? t("wallet.walletDialogDeleting") : t("wallet.walletDialogDeleteAction")}
                    </button>
                  )
                ) : null}
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
