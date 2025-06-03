<template>
  <div class="app-font table-wrapper" style="position: relative">
    <!-- Таблица -->
    <q-table
      :columns="columns"
      :rows="coins"
      row-key="id"
      title="Crypto Coins"
      :pagination="{ rowsPerPage: 10 }"
      flat
      :loading="false"
    >
      <!-- Вставь сюда все твои слоты (логику отображения ячеек) -->
      <template v-slot:body-cell-name="props">
        <td class="q-td">
          <div class="coin-name-cell">
            <img v-if="props.row.iconUrl" :src="props.row.iconUrl" alt="icon" class="coin-icon" />
            <div>
              <div style="font-weight: bold">{{ props.value }}</div>
              <div class="coin-symbol">{{ props.row.symbol }}</div>
            </div>
          </div>
        </td>
      </template>
      <template v-slot:body-cell-buy="props">
        <td class="q-td" style="text-align: center">
          <q-btn
            label="Buy"
            size="sm"
            unelevated
            style="
              background-color: white;
              border: 1.5px solid limegreen;
              color: limegreen;
              font-weight: bold;
              padding: 0 15px;
            "
            @click="buyCoin(props.row)"
            dense
          />
        </td>
      </template>
      <template v-slot:body-cell-priceNum="props">
        <td class="q-td" style="text-align: right">
          {{ formatPrice(props.value) }}
        </td>
      </template>
      <template v-slot:body-cell-change="props">
        <td class="q-td" :class="getChangeClass(props.value)" style="text-align: right">
          {{ formatChange(props.value) }}
        </td>
      </template>
      <template v-slot:body-cell-volume="props">
        <td class="q-td" style="text-align: right">
          {{ formatVolume(props.value) }}
        </td>
      </template>
      <template v-slot:body-cell-history7d="props">
        <td class="q-td" style="padding: 0 10px; width: 140px; max-width: 140px">
          <apexchart
            v-if="props.value && props.value.length"
            type="line"
            :series="[{ data: props.value }]"
            :options="getSparklineOptions(props.value)"
            height="40"
            width="140"
          />
        </td>
      </template>
    </q-table>

    <!-- Полупрозрачный оверлей со спиннером -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots size="70px" color="limegreen" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { QTable, QBtn, QSpinnerDots } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'CoinsTable',
  components: { QTable, QBtn, QSpinnerDots, apexchart: VueApexCharts },
  data() {
    return {
      coins: [],
      loading: true,
      columns: [
        { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
        { name: 'buy', label: 'Buy', field: 'buy', sortable: false, align: 'center' },
        { name: 'priceNum', label: 'Price', field: 'priceNum', sortable: true, align: 'right' },
        { name: 'change', label: 'Change 24h', field: 'change', sortable: true, align: 'right' },
        { name: 'volume', label: 'Volume 24h', field: 'volume', sortable: true, align: 'right' },
        {
          name: 'history7d',
          label: '7d Price',
          field: 'history7d',
          sortable: false,
          align: 'center',
        },
      ],
      sparklineOptionsDefault: {
        chart: {
          sparkline: { enabled: true },
          toolbar: { show: false },
        },
        stroke: {
          curve: 'smooth',
          width: 2,
        },
        tooltip: {
          enabled: false,
        },
        grid: { show: false },
        yaxis: { show: false },
        xaxis: {
          labels: { show: false },
          axisTicks: { show: false },
          axisBorder: { show: false },
        },
      },
    }
  },
  methods: {
    formatVolume(value) {
      if (!value) return '0'
      if (value >= 1e9) return (value / 1e9).toFixed(2) + ' B'
      if (value >= 1e6) return (value / 1e6).toFixed(2) + ' M'
      if (value >= 1e3) return (value / 1e3).toFixed(2) + ' K'
      return Number(value).toLocaleString()
    },
    formatPrice(value) {
      return `$ ${value.toFixed(2)}`
    },
    formatChange(value) {
      return `${value}%`
    },
    getChangeClass(value) {
      if (value > 0) return 'text-positive'
      if (value < 0) return 'text-negative'
      return ''
    },
    getSparklineOptions(data) {
      if (!data || data.length === 0) return this.sparklineOptionsDefault

      const first = data[0]
      const last = data[data.length - 1]
      const color = last >= first ? 'limegreen' : 'red'

      return {
        ...this.sparklineOptionsDefault,
        stroke: {
          ...this.sparklineOptionsDefault.stroke,
          colors: [color],
        },
      }
    },
    async fetchCoinHistory(uuid) {
      try {
        const response = await axios.get(
          `https://api.coinranking.com/v2/coin/${uuid}/history?timePeriod=7d`,
          {
            headers: {
              'x-access-token': 'coinranking0032526aa0947040d370c5a15d66f8898f64707cb718e699',
            },
          },
        )
        return response.data.data.history
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((item) => (item.price ? parseFloat(item.price) : null))
          .filter((v) => v !== null)
      } catch (e) {
        console.error('Error loading history for', uuid, e)
        return []
      }
    },
    async fetchCoins() {
      this.loading = true
      try {
        const response = await axios.get('https://api.coinranking.com/v2/coins?limit=20', {
          headers: {
            'x-access-token': 'coinranking0032526aa0947040d370c5a15d66f8898f64707cb718e699',
          },
        })

        const coins = response.data.data.coins

        // Для каждого coin загружаем историю цены 7 дней
        const coinsWithHistory = await Promise.all(
          coins.map(async (coin) => {
            const history7d = await this.fetchCoinHistory(coin.uuid)
            return {
              id: coin.uuid,
              iconUrl: coin.iconUrl,
              name: coin.name,
              symbol: coin.symbol,
              priceNum: parseFloat(coin.price),
              change: parseFloat(coin.change),
              volume: parseFloat(coin['24hVolume'] || coin.volume),
              history7d,
              favorite: false,
            }
          }),
        )

        this.coins = coinsWithHistory
      } catch (error) {
        console.error('Error loading coins:', error)
      } finally {
        this.loading = false
      }
    },
    buyCoin(coin) {
      alert(`Buying a coin: ${coin.name} (${coin.symbol}), price ${coin.priceNum.toFixed(2)}$`)
    },
  },
  mounted() {
    this.fetchCoins()
  },
}
</script>

<style scoped>
.app-font {
  max-width: 90%;
  margin: 0 auto;
  padding: 16px;
  color: #424961;
  position: relative;
}
.coin-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
.coin-name-cell {
  display: flex;
  align-items: center;
  letter-spacing: 0.5px;
}
.text-positive {
  color: green;
}
.text-negative {
  color: red;
}
.coin-symbol {
  color: gray;
  line-height: 1;
}
.q-td {
  font-size: 16px;
}

/* Оверлей с затемнением и спиннером */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255 255 255 / 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>
