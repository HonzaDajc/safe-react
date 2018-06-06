// @flow
import { createAction } from 'redux-actions'
import { type DailyLimitProps } from '~/routes/safe/store/model/dailyLimit'

export const UPDATE_DAILY_LIMIT = 'UPDATE_DAILY_LIMIT'

type SpentTodayProps = {
  safeAddress: string,
  dailyLimit: DailyLimitProps,
}

const updateDailyLimit = createAction(
  UPDATE_DAILY_LIMIT,
  (safeAddress: string, dailyLimit: DailyLimitProps): SpentTodayProps => ({
    safeAddress,
    dailyLimit,
  }),
)

export default updateDailyLimit