"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { ApiError } from "@/lib/api";

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  district: string;
  city: string;
  postalCode: string | null;
  country: string;
  defaultAddress: boolean;
};

type AddressForm = Omit<Address, "id" | "addressLine2" | "postalCode"> & {
  addressLine2: string;
  postalCode: string;
};

const emptyAddress: AddressForm = {
  label: "Ev",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  district: "",
  city: "",
  postalCode: "",
  country: "Türkiye",
  defaultAddress: false,
};

export function AddressManager({
  authenticatedFetch,
  defaultNames,
}: {
  authenticatedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
  defaultNames: { firstName: string; lastName: string };
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setAddresses(await authenticatedFetch<Address[]>("/api/users/me/addresses"));
      setNotice("");
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Adresler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    setEditingId(null);
    setForm({
      ...emptyAddress,
      firstName: defaultNames.firstName,
      lastName: defaultNames.lastName,
      defaultAddress: addresses.length === 0,
    });
    setNotice("");
  }

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      ...address,
      addressLine2: address.addressLine2 ?? "",
      postalCode: address.postalCode ?? "",
    });
    setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setNotice("");
    try {
      await authenticatedFetch<Address>(
        editingId ? `/api/users/me/addresses/${editingId}` : "/api/users/me/addresses",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) }
      );
      setForm(null);
      setEditingId(null);
      await load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Adres kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(address: Address) {
    if (!window.confirm(`“${address.label}” adresini kaldırmak istediğinize emin misiniz?`)) return;
    try {
      await authenticatedFetch<void>(`/api/users/me/addresses/${address.id}`, { method: "DELETE" });
      if (editingId === address.id) setForm(null);
      await load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Adres kaldırılamadı.");
    }
  }

  return (
    <>
      <h1 className="display text-4xl">Adresler</h1>
      {loading ? (
        <p className="mt-10">Adresler yükleniyor…</p>
      ) : addresses.length ? (
        <div className="mt-8 divide-y divide-black/15 border-y border-black/15">
          {addresses.map((address) => (
            <section key={address.id} className="flex items-start justify-between gap-5 py-7">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{address.label}</h2>
                  {address.defaultAddress && (
                    <span className="bg-black px-2 py-1 text-xs font-bold text-white">
                      Varsayılan
                    </span>
                  )}
                </div>
                <p className="mt-4 font-semibold">
                  {address.firstName} {address.lastName}
                </p>
                <p className="mt-1 max-w-xl leading-6 text-black/70">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  <br />
                  {address.district} / {address.city}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                  <br />
                  {address.country} · {address.phone}
                </p>
                <button
                  onClick={() => startEdit(address)}
                  className="focus-ring mt-4 flex items-center gap-2 font-semibold"
                >
                  <ArrowRight size={16} /> Adresi düzenle
                </button>
              </div>
              <button
                onClick={() => void remove(address)}
                className="focus-ring flex items-center gap-1 font-semibold"
              >
                <X size={15} /> Kaldır
              </button>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-black/65">Henüz kayıtlı teslimat adresiniz yok.</p>
      )}

      {notice && <p className="mt-6 border border-red-700 bg-red-50 p-3 text-red-900">{notice}</p>}

      {form ? (
        <form onSubmit={save} className="mt-10 max-w-2xl border-t border-black/15 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="display text-3xl">{editingId ? "Adresi düzenle" : "Yeni adres"}</h2>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="focus-ring p-2"
              aria-label="Formu kapat"
            >
              <X />
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <AddressField
              label="Adres adı"
              value={form.label}
              onChange={(value) => setForm({ ...form, label: value })}
            />
            <AddressField
              label="Telefon"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              autoComplete="tel"
            />
            <AddressField
              label="Ad"
              value={form.firstName}
              onChange={(value) => setForm({ ...form, firstName: value })}
              autoComplete="given-name"
            />
            <AddressField
              label="Soyad"
              value={form.lastName}
              onChange={(value) => setForm({ ...form, lastName: value })}
              autoComplete="family-name"
            />
            <div className="sm:col-span-2">
              <AddressField
                label="Adres"
                value={form.addressLine1}
                onChange={(value) => setForm({ ...form, addressLine1: value })}
                autoComplete="address-line1"
              />
            </div>
            <div className="sm:col-span-2">
              <AddressField
                label="Apartman, daire, kat (isteğe bağlı)"
                value={form.addressLine2}
                onChange={(value) => setForm({ ...form, addressLine2: value })}
                required={false}
                autoComplete="address-line2"
              />
            </div>
            <AddressField
              label="İlçe"
              value={form.district}
              onChange={(value) => setForm({ ...form, district: value })}
            />
            <AddressField
              label="Şehir"
              value={form.city}
              onChange={(value) => setForm({ ...form, city: value })}
              autoComplete="address-level1"
            />
            <AddressField
              label="Posta kodu (isteğe bağlı)"
              value={form.postalCode}
              onChange={(value) => setForm({ ...form, postalCode: value })}
              required={false}
              autoComplete="postal-code"
            />
            <AddressField
              label="Ülke"
              value={form.country}
              onChange={(value) => setForm({ ...form, country: value })}
              autoComplete="country-name"
            />
          </div>
          <label className="mt-5 flex items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={form.defaultAddress}
              onChange={(event) => setForm({ ...form, defaultAddress: event.target.checked })}
            />
            Varsayılan teslimat adresi yap
          </label>
          <button
            disabled={saving}
            className="focus-ring mt-7 bg-black px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : "Adresi kaydet"}
          </button>
        </form>
      ) : (
        <button
          onClick={startNew}
          className="focus-ring mt-10 flex items-center gap-2 font-semibold"
        >
          <Plus size={16} /> Yeni adres ekle
        </button>
      )}
    </>
  );
}

function AddressField({
  label,
  value,
  onChange,
  required = true,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block font-semibold">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-2 w-full border border-black/25 bg-white px-3 py-3 outline-none focus:border-black"
      />
    </label>
  );
}
