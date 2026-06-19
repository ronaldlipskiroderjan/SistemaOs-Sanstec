import { axiosClient } from './axiosClient'
import { DashboardResumo } from '../types'

export const dashboardApi = {
  resumo: (): Promise<DashboardResumo> =>
    axiosClient.get('/api/dashboard/resumo').then(r => r.data),
}
