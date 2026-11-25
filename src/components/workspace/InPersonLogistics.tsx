import React from 'react';
import {
  MapPin,
  Luggage,
  Calendar,
  Phone,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface InPersonLogisticsProps {
  workspaceId: string;
  opportunityTitle?: string;
}

export const InPersonLogistics: React.FC<InPersonLogisticsProps> = ({
  workspaceId,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(workspaceId));
  const toggleLogisticsItemPacked = useWorkspaceStore((state) => state.toggleLogisticsItemPacked);

  const logistics = workspace?.logistics;

  if (!logistics) {
    return (
      <div className="surface-card p-10 rounded-2xl text-center space-y-2">
        <p className="text-sm font-semibold text-[#18181B]">Online Participation</p>
        <p className="text-xs text-[#52525B] max-w-md mx-auto">
          No physical venue, travel, or packing checklist is required for this format.
        </p>
      </div>
    );
  }

  const packedCount = logistics.packingList.filter((i) => i.packed).length;
  const totalItems = logistics.packingList.length;

  return (
    <div className="space-y-6">
      {/* Venue & Transportation Card */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <MapPin className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#63636B] uppercase tracking-wider block">
                Venue & Location
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#18181B]">
                {logistics.venueName}
              </h2>
              <p className="text-xs sm:text-sm text-[#52525B]">
                {logistics.venueAddress}
              </p>
              <p className="text-xs text-[#52525B] pt-1">
                Travel note: {logistics.mapDirections}
              </p>
            </div>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(logistics.venueAddress)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 min-h-[40px]"
          >
            <span>Open in Google Maps</span>
            <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
          </a>
        </div>
      </div>

      {/* Grid: Packing List & Event Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Packing Checklist */}
        <div className="lg:col-span-7 surface-card p-6 sm:p-8 rounded-2xl space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap pb-1">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-xl bg-[#F4F4F6] flex items-center justify-center text-[#18181B]"
              >
                <Luggage className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#18181B]">
                  Packing Checklist
                </h3>
                <p className="text-xs text-[#52525B]">
                  Essentials for on-site check-in and demos
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#F4F4F6] text-[#18181B] tabular-nums">
              {packedCount} / {totalItems} Packed
            </span>
          </div>

          <div className="space-y-2.5">
            {logistics.packingList.map((item) => (
              <button
                type="button"
                role="checkbox"
                aria-checked={item.packed}
                key={item.id}
                onClick={() => {
                  toggleLogisticsItemPacked(workspaceId, item.id);
                  toast.success(item.packed ? `Unchecked ${item.item}` : `Packed: ${item.item}`);
                }}
                className={`w-full p-3.5 rounded-xl flex items-center justify-between gap-3 text-start transition-[transform,background-color] duration-150 active:scale-[0.98] ${
                  item.packed
                    ? 'bg-[#F4F4F6]/80 opacity-80'
                    : 'bg-[#F4F4F6] hover:bg-[#EBECEF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.packed
                        ? 'bg-[#047857] text-white'
                        : 'bg-white shadow-[inset_0_0_0_1px_oklch(0_0_0/0.15)]'
                    }`}
                  >
                    {item.packed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      item.packed ? 'text-[#63636B] line-through' : 'text-[#18181B]'
                    }`}
                  >
                    {item.item}
                  </span>
                </div>

                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-white shadow-[0_0_0_1px_oklch(0_0_0/0.05)] text-[#52525B] flex-shrink-0">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule & Emergency Contacts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5 pb-1">
              <Calendar aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
              <h3 className="text-base font-semibold text-[#18181B]">
                Schedule & Milestones
              </h3>
            </div>

            <div className="space-y-3">
              {logistics.schedule.map((slot, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs p-2.5 rounded-xl bg-[#F4F4F6]">
                  <span className="font-mono font-semibold text-[#52525B] whitespace-nowrap">
                    {slot.time}
                  </span>
                  <span className="font-medium text-[#18181B] leading-snug">
                    {slot.activity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <Phone aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
              <h3 className="text-base font-semibold text-[#18181B]">
                Organizer Contacts
              </h3>
            </div>

            <div className="space-y-2.5">
              {logistics.emergencyContacts.map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#F4F4F6] flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-[#18181B] block">{c.name}</span>
                    <span className="text-[11px] text-[#52525B]">{c.role}</span>
                  </div>
                  <span className="font-mono font-medium text-[#18181B] bg-white shadow-border px-2.5 py-1 rounded-lg flex-shrink-0">
                    {c.contact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
