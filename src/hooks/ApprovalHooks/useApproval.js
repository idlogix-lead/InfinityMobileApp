import {useQuery, useMutation, useQueryClient} from 'react-query';

import {fetchPayment, fetchWFAct} from '../../services/api/approvalsAPI/approvalApi';

export const useWFAct = () => useQuery('wfActivity', fetchWFAct);
export const usePayment = () => useQuery('payment', fetchPayment);

// import dayjs from 'dayjs';
// import {useQuery} from 'react-query';
// import {fetchWFAct} from '../../api/approvalsAPI/approvalApi';

// START $ END LIMIT

// export const useWFAct = () => {
//   const startDate = dayjs()
//     .subtract(7, 'day')
//     .startOf('day')
//     .format('YYYY-MM-DDTHH:mm:ss[Z]');

//   const endDate = dayjs()
//     .add(1, 'day')
//     .startOf('day')
//     .format('YYYY-MM-DDTHH:mm:ss[Z]');

//   const filter = `Created ge '${startDate}' and Created lt '${endDate}'`;

//   return useQuery(['wfActivity', startDate, endDate], () => fetchWFAct(filter));
// };

// START LIMIT

// export const useWFAct = () => {
//   const startDate = dayjs('2026-01-01')
//     .startOf('day')
//     .format('YYYY-MM-DDTHH:mm:ss[Z]');

//   const filter = `Created ge '${startDate}'`;

//   return useQuery(
//     ['wfActivity', startDate],
//     () => fetchWFAct(filter)
//   );
// };

