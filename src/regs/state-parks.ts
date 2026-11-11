/**
 * State parks closed to hunting, by license year.
 *
 * DCR lists the parks that offer hunting each year ("Specific sites that offer hunting may
 * change from year to year"). Parks not on the list are closed. 2026-27: DCR state park
 * hunting page (modified 2026-08-26) and hunt chart
 * (https://www.dcr.virginia.gov/state-parks/document/vsp-huntchart-26-27.pdf), checked
 * 2026-11-11; see sources/lands/state-parks.json. Parks on the list stay "check DCR"
 * (or follow the property rules in the species files).
 */
const CLOSED: Record<number, string[]> = {
  2026: [
    'Bear Creek Lake State Park',
    'Belle Isle State Park',
    'Culpeper Battlefields State Park',
    'Douthat State Park',
    'False Cape State Park',
    'First Landing State Park',
    'Hayfields State Park',
    'High Bridge Trail State Park',
    'Holliday Lake State Park',
    'Mayo River State Park',
    'Middle Peninsula State Park',
    'Natural Bridge State Park',
    'New River Trail State Park',
    'Powhatan State Park',
    'Sailors Creek Battlefield Historic State Park',
    'Seven Bends State Park',
    'Shot Tower Historic State Park',
    'Sky Meadows State Park',
    'Staunton River Battlefield State Park',
    'Twin Lakes State Park',
    'Westmoreland State Park',
    'Wilderness Road State Park',
  ],
};

export const stateParkClosed = (property: string | undefined, licenseYear: number) =>
  !!property && !!CLOSED[licenseYear]?.includes(property);

export const STATE_PARK_CLOSED_NOTE =
  'State park closed to hunting this license year (not on DCR’s state park hunting list).';
