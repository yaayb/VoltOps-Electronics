import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Plus,
  Wrench,
} from 'lucide-react';
import { useCreateRmaTicket, useUpdateRmaStatus } from '../../hooks/useSerials';
import { RmaStatus, RmaTicket, SerialUnitDetail } from '../../types';

interface RmaRepairDeskProps {
  tickets: RmaTicket[];
  serials: SerialUnitDetail[];
  prefillSerial?: string;
  prefillCustomer?: string;
  onClearPrefill?: () => void;
}

const RMA_STAGES: RmaStatus[] = [
  'RECEIVED',
  'DIAGNOSING',
  'REPAIRING',
  'RESOLVED',
];

export function RmaRepairDesk({
  tickets,
  serials,
  prefillSerial,
  prefillCustomer,
  onClearPrefill,
}: RmaRepairDeskProps): React.ReactElement {
  const createRmaMutation = useCreateRmaTicket();
  const updateRmaMutation = useUpdateRmaStatus();

  const [serialInput, setSerialInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prefillSerial) {
      setSerialInput(prefillSerial);
      setCustomerName(prefillCustomer || 'Warranty Claimant');
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillSerial, prefillCustomer, onClearPrefill]);

  const eligibleSerials = serials.filter((s) => s.status !== 'RMA');

  const handleSelectEligibleSerial = (sn: string): void => {
    setSerialInput(sn);
    const match = serials.find((s) => s.serial === sn);
    if (match?.customerName) {
      setCustomerName(match.customerName);
    } else if (!customerName) {
      setCustomerName('Warehouse Bench QA');
    }
  };

  const handleOpenTicket = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await createRmaMutation.mutateAsync({
        serial: serialInput.trim().toUpperCase(),
        customerName: customerName.trim(),
        issueDescription: issueDescription.trim(),
        technicianNotes: technicianNotes.trim(),
      });
      setSerialInput('');
      setCustomerName('');
      setIssueDescription('');
      setTechnicianNotes('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to open RMA ticket');
    }
  };

  const handleAdvanceStage = async (
    ticket: RmaTicket,
    nextStage: RmaStatus
  ): Promise<void> => {
    setErrorMsg(null);
    try {
      await updateRmaMutation.mutateAsync({
        id: ticket.id,
        status: nextStage,
        technicianNotes: noteDrafts[ticket.id] ?? ticket.technicianNotes,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const filteredTickets = tickets.filter(
    (t) => statusFilter === 'ALL' || t.status === statusFilter
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Intake Form */}
      <div className="lg:col-span-4">
        <form
          onSubmit={(e) => void handleOpenTicket(e)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Open Warranty RMA Repair Ticket
            </h3>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Hardware Serial / IMEI Number
            </label>
            <input
              type="text"
              required
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value.toUpperCase())}
              placeholder="SN-APLMBP1-1001"
              className="w-full px-3 py-2 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
            {eligibleSerials.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) handleSelectEligibleSerial(e.target.value);
                }}
                className="mt-1.5 w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              >
                <option value="">Quick-pick registered serial...</option>
                {eligibleSerials.slice(0, 20).map((s) => (
                  <option key={s.id} value={s.serial}>
                    {s.serial} — {s.product.name} ({s.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Customer / Claimant Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jordan Taylor"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Reported Hardware Fault / Symptom
            </label>
            <textarea
              required
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g. USB-C Thunderbolt port intermittent charging under load..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Initial Bench Intake Notes (Optional)
            </label>
            <input
              type="text"
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Visual chassis inspection clean, running Apple AST2 diagnostics..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={createRmaMutation.isPending}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>
              {createRmaMutation.isPending
                ? 'Creating RMA Ticket...'
                : 'Log Serial into RMA Bench'}
            </span>
          </button>
        </form>
      </div>

      {/* Right Active RMA Bench Pipeline */}
      <div className="lg:col-span-8 space-y-4">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono uppercase text-slate-500 px-2">
            Active Repair Pipeline ({filteredTickets.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['ALL', ...RMA_STAGES] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No RMA repair tickets in this queue
            </p>
            <p className="text-xs text-slate-500">
              Use the intake form on the left or click &ldquo;Open RMA&rdquo; from the Serial Registry to log a hardware unit for warranty service.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTickets.map((ticket) => {
              const currentIdx = RMA_STAGES.indexOf(ticket.status);
              const nextStage =
                currentIdx >= 0 && currentIdx < RMA_STAGES.length - 1
                  ? RMA_STAGES[currentIdx + 1]
                  : null;
              const draftNote =
                noteDrafts[ticket.id] ?? ticket.technicianNotes ?? '';

              return (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-amber-500">
                          {ticket.ticketNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 font-mono text-xs text-cyan-500">
                          <Cpu className="w-3 h-3" />
                          {ticket.serialUnit.serial}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                        {ticket.serialUnit.product.name} · Claimant:{' '}
                        {ticket.customerName}
                      </h4>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-mono font-bold text-xs ${
                        ticket.status === 'RESOLVED'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-800 dark:text-slate-100">
                      Fault:
                    </strong>{' '}
                    {ticket.issueDescription}
                  </p>

                  {/* 4-Stage Stepper */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {RMA_STAGES.map((stage, idx) => {
                      const passed = idx <= currentIdx;
                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => void handleAdvanceStage(ticket, stage)}
                          className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold border transition-colors ${
                            passed
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-500'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>

                  {/* Technician Bench Notes & Quick Advance */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <input
                      type="text"
                      value={draftNote}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      placeholder="Technician bench diagnostic notes..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                    {nextStage ? (
                      <button
                        type="button"
                        disabled={updateRmaMutation.isPending}
                        onClick={() => void handleAdvanceStage(ticket, nextStage)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0"
                      >
                        <span>Advance to {nextStage}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={updateRmaMutation.isPending}
                        onClick={() => void handleAdvanceStage(ticket, 'RESOLVED')}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs shrink-0"
                      >
                        Save Notes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
