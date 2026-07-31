-- CrewMatrix â€” seed data
--
-- Run after schema.sql. Companies are linked to auth.users through owner_id;
-- until real accounts exist we point every row at a single placeholder uuid so
-- the tables are queryable, then re-point them as people sign up:
--
--   update companies set owner_id = '<real uuid>' where id = 'sub-vega';
--
-- Paste straight into the Supabase SQL Editor, or run:
--   psql "$SUPABASE_DB_URL" -f supabase/seed.sql

insert into companies (
  id, owner_id, role, name, contact, trades, city, state, service_radius_miles,
  crew_size, years_in_business, rating, review_count, completed_jobs,
  license_number, license_status, license_expires,
  insurance_carrier, insurance_status, insurance_coverage, insurance_expires,
  bio, accent
) values
  ('gc-halloran', null, 'contractor', 'Halloran Build Group', 'Dana Halloran',
   '{Framing,Concrete}', 'Denver', 'CO', 60, 34, 18, 4.8, 96, 212,
   'CO-GC-114820', 'verified', '2027-03-31', 'Cascade Mutual', 'verified', 2000000, '2027-01-15',
   'Commercial and multi-family general contractor working the Front Range. We self-perform concrete and framing and sub out the rest to crews we keep coming back to.', '#f2a33c'),

  ('gc-brightline', null, 'contractor', 'Brightline Construction', 'Marcus Ojo',
   '{Framing}', 'Aurora', 'CO', 45, 21, 9, 4.6, 51, 88,
   'CO-GC-220914', 'verified', '2026-11-30', 'Ironpoint', 'verified', 1000000, '2026-12-01',
   'Tenant improvement and light commercial. Most of our work is 6-14 week build-outs where schedule matters more than the last 2% on price.', '#5aa9e6'),

  ('gc-marlow', null, 'contractor', 'Marlow & Sons', 'Ruth Marlow',
   '{Masonry,Concrete}', 'Fort Collins', 'CO', 75, 12, 27, 4.9, 140, 305,
   'CO-GC-098331', 'verified', '2028-06-30', 'Cascade Mutual', 'verified', 2000000, '2027-05-20',
   'Third-generation builder. Residential custom and historic restoration - we care a great deal about who we let on a site.', '#c98b6b'),

  ('sub-vega', null, 'subcontractor', 'Vega Electric', 'Luis Vega',
   '{Electrical}', 'Denver', 'CO', 50, 9, 12, 4.9, 74, 168,
   'CO-EC-55219', 'verified', '2027-08-31', 'Ironpoint', 'verified', 1000000, '2027-02-28',
   'Commercial electrical - service, panels, tenant fit-outs. Two master electricians on staff. We hold the schedule and we call you before you have to call us.', '#f2a33c'),

  ('sub-northpeak', null, 'subcontractor', 'Northpeak Mechanical', 'Sasha Peret',
   '{HVAC,Plumbing}', 'Longmont', 'CO', 70, 14, 16, 4.7, 63, 141,
   'CO-MC-30877', 'verified', '2027-04-30', 'Granite State', 'verified', 2000000, '2026-10-31',
   'Rooftop units, hydronic, and full mechanical rough-in. We prefer design-assist work where we can flag the clash before it is framed in.', '#5aa9e6'),

  ('sub-ridgeline', null, 'subcontractor', 'Ridgeline Drywall', 'Tomas Reyes',
   '{Drywall,Painting}', 'Denver', 'CO', 40, 22, 7, 4.5, 39, 97,
   'CO-SC-71204', 'verified', '2026-09-30', 'Ironpoint', 'pending', 1000000, '2026-08-15',
   'Hang, tape, texture and finish. Large crews available on two weeks notice - we staff up for production work without dropping the finish level.', '#3fae7a'),

  ('sub-caldera', null, 'subcontractor', 'Caldera Concrete', 'Nia Osborne',
   '{Concrete,Excavation}', 'Brighton', 'CO', 65, 18, 21, 4.8, 88, 190,
   'CO-SC-44190', 'verified', '2027-12-31', 'Cascade Mutual', 'verified', 2000000, '2027-07-01',
   'Flatwork, foundations, tilt-up. We own our pumps and forms, which is usually why we can hold a date when the weather moves.', '#c98b6b'),

  ('sub-summit', null, 'subcontractor', 'Summit Roofing Co.', 'Grant Feld',
   '{Roofing}', 'Boulder', 'CO', 55, 11, 14, 4.6, 57, 128,
   'CO-SC-66031', 'verified', '2026-10-31', 'Granite State', 'verified', 1000000, '2027-03-15',
   'TPO, EPDM and standing seam. Hail-market experience and we document everything for the adjuster.', '#d9634f'),

  ('sub-fieldstone', null, 'subcontractor', 'Fieldstone Masonry', 'Amara Kite',
   '{Masonry}', 'Fort Collins', 'CO', 80, 8, 19, 5.0, 44, 76,
   'CO-SC-51882', 'verified', '2028-01-31', 'Cascade Mutual', 'verified', 1000000, '2027-09-30',
   'Brick, block and stone veneer, including restoration on historic facades. Small crew, long lead times, worth the wait.', '#f2a33c'),

  ('sub-atlas', null, 'subcontractor', 'Atlas Framing', 'Dee Okafor',
   '{Framing}', 'Aurora', 'CO', 45, 26, 10, 4.4, 61, 133,
   'CO-SC-38210', 'expired', '2026-05-31', 'Ironpoint', 'verified', 1000000, '2027-01-31',
   'Wood and light-gauge framing crews for multi-family. We run two to four crews depending on the season.', '#5aa9e6')
on conflict (id) do nothing;

insert into projects (
  id, contractor_id, title, trade, city, state, distance_miles,
  budget_low, budget_high, start_date, duration_weeks, status, scope,
  requirements, posted_at, bid_count, platform_fee_pct
) values
  ('prj-1042', 'gc-halloran', 'Electrical rough-in - 48-unit multi-family, Building C', 'Electrical',
   'Denver', 'CO', 8, 145000, 178000, '2026-08-17', 9, 'open',
   'Full electrical rough-in for Building C of a three-building wood-frame development. Panels, unit feeders, device boxes and low-voltage sleeves. Drawings are permitted and released; no design work required.',
   '{"Active Colorado EC license","$1M general liability minimum","Two crews available from mid-August","Weekly look-ahead schedule submitted every Friday"}',
   '2026-07-24', 4, 4.0),

  ('prj-1038', 'gc-brightline', 'Mechanical fit-out - 14,000 sq ft office tenant improvement', 'HVAC',
   'Aurora', 'CO', 14, 96000, 120000, '2026-08-03', 6, 'open',
   'Replace two rooftop units and run new distribution for an open-plan office fit-out. Existing curbs stay. Crane pick is scheduled and paid for by the GC.',
   '{"Colorado mechanical contractor license","Experience with occupied-building work and after-hours tie-ins","Provide submittals within 5 business days of award"}',
   '2026-07-21', 3, 4.0),

  ('prj-1031', 'gc-marlow', 'Stone veneer and chimney restoration - 1908 residence', 'Masonry',
   'Fort Collins', 'CO', 3, 41000, 58000, '2026-09-07', 5, 'open',
   'Repoint and partially rebuild two chimneys, replace failed stone veneer on the north elevation. Historic district - mortar match must be approved before full production.',
   '{"Documented historic restoration references","Lime mortar experience","Scaffold and protection included in bid"}',
   '2026-07-19', 2, 4.0),

  ('prj-1027', 'gc-halloran', 'Foundation and flatwork - retail pad, 11,000 sq ft', 'Concrete',
   'Brighton', 'CO', 22, 210000, 245000, '2026-08-24', 11, 'awarded',
   'Spread footings, stem walls, slab-on-grade and exterior flatwork for a single-tenant retail pad. Soils report and pad certification complete.',
   '{"Own pump equipment preferred","$2M general liability","Concrete testing coordination"}',
   '2026-07-08', 5, 4.0),

  ('prj-1019', 'gc-brightline', 'Drywall hang and finish - level 4, 22,000 sq ft', 'Drywall',
   'Denver', 'CO', 11, 78000, 92000, '2026-07-27', 7, 'in_progress',
   'Hang, tape and finish to level 4 across two floors, including bulkheads and hard-lid ceilings. Framing is complete on level one.',
   '{"Crew of 10+ available","Level 4 finish across all public areas","Daily cleanup included"}',
   '2026-06-30', 6, 4.0),

  ('prj-1012', 'gc-marlow', 'Roof replacement - 9,500 sq ft TPO over occupied warehouse', 'Roofing',
   'Boulder', 'CO', 18, 64000, 81000, '2026-07-13', 4, 'complete',
   'Tear-off to deck and install 60 mil TPO with tapered insulation. Building stays occupied - sections must be dried in nightly.',
   '{"Manufacturer certification for warranty","Night dry-in plan","$1M general liability"}',
   '2026-06-02', 4, 4.0)
on conflict (id) do nothing;

insert into bids (id, project_id, subcontractor_id, amount, crew_size, start_available, duration_weeks, note, status, submitted_at) values
  ('bid-5501', 'prj-1042', 'sub-vega', 158400, 8, '2026-08-17', 9,
   'We have run three buildings on this exact unit type. Price includes temp power maintenance. We can start the Monday you release Building C.', 'shortlisted', '2026-07-25'),
  ('bid-5502', 'prj-1042', 'sub-northpeak', 171000, 6, '2026-08-24', 10,
   'One week later than your date - we finish a hospital tie-in the week prior and will not overpromise.', 'submitted', '2026-07-26'),
  ('bid-5510', 'prj-1038', 'sub-northpeak', 104500, 7, '2026-08-03', 6,
   'Includes after-hours tie-ins on the two Saturdays required. Submittals in four days on award.', 'shortlisted', '2026-07-23'),
  ('bid-5514', 'prj-1031', 'sub-fieldstone', 52800, 4, '2026-09-07', 6,
   'We will build three mortar sample panels for the district before production. One extra week in the schedule accounts for approval.', 'submitted', '2026-07-22'),
  ('bid-5520', 'prj-1027', 'sub-caldera', 228700, 12, '2026-08-24', 11,
   'Own pumps and forms. Price holds through September if the pad certification does not change.', 'awarded', '2026-07-11'),
  ('bid-5527', 'prj-1019', 'sub-ridgeline', 84200, 14, '2026-07-27', 7,
   'Two crews, level 4 throughout. Daily cleanup and stocking included.', 'awarded', '2026-07-02')
on conflict (id) do nothing;

insert into messages (id, project_id, from_id, to_id, body, sent_at) values
  ('msg-9001', 'prj-1042', 'gc-halloran', 'sub-vega',
   'Your number looks workable. Can you hold the crew count at eight through the first four weeks?', '2026-07-26T14:05:00Z'),
  ('msg-9002', 'prj-1042', 'sub-vega', 'gc-halloran',
   'Yes - eight through rough-in, then we drop to five for trim. I will send the look-ahead Friday either way.', '2026-07-26T15:41:00Z'),
  ('msg-9003', 'prj-1038', 'sub-northpeak', 'gc-brightline',
   'Confirming the crane pick is on your side. If it slips past the 5th our sequence changes and I will reprice.', '2026-07-24T09:12:00Z'),
  ('msg-9004', 'prj-1038', 'gc-brightline', 'sub-northpeak',
   'Crane is booked and paid. Understood on the reprice condition.', '2026-07-24T11:30:00Z')
on conflict (id) do nothing;

insert into payouts (id, project_id, subcontractor_id, gross, fee_pct, status, released_at) values
  ('po-3301', 'prj-1019', 'sub-ridgeline', 42100, 4.0, 'paid', '2026-07-15'),
  ('po-3302', 'prj-1019', 'sub-ridgeline', 42100, 4.0, 'pending', null),
  ('po-3310', 'prj-1027', 'sub-caldera', 76200, 4.0, 'in_transit', '2026-07-26'),
  ('po-3315', 'prj-1012', 'sub-summit', 71400, 4.0, 'paid', '2026-07-10')
on conflict (id) do nothing;

