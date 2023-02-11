import FileManagerPlugin from 'filemanager-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import path from 'node:path'

const root = path.resolve(path.resolve())

export default ({ /* WEBPACK_BUNDLE, WEBPACK_SERVE */ }, { mode }) => {
  mode = (mode || 'development').trim().toLowerCase()

  const DEV = mode === 'development'

  return {
    mode,

    ...(DEV && { devtool: 'eval-source-map' }),

    context: path.resolve(root, 'src'),

    entry: {
      'ease-visualizer': './ease-visualizer.js',
    },
    output: {
      path: path.resolve(root, 'dist'),
      filename: 'js/[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/i,
          use: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            (DEV ? 'style-loader' : MiniCssExtractPlugin.loader), 'css-loader', 'sass-loader'
          ]
        },
        {
          test: /\.(jpe?g|png|gif|svg|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: path.join('img', '[name].[contenthash:8][ext]')
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(root, 'src', 'static/index.html'),
        filename: path.resolve(root, 'dist', 'index.html'),
      }),

      new MiniCssExtractPlugin({
        chunkFilename: 'css/[id].css',
        filename: 'css/style.css'
      }),

      new FileManagerPlugin({
        events: {
          onStart: {
            delete: [path.resolve(root, 'dist')],
            copy: [{
              source: path.resolve(root, 'src', 'static'),
              destination: path.resolve(root, 'dist')
            }]
          }
        }
      })
    ],
    optimization: {
      minimize: !DEV,
      runtimeChunk: true
    },
    devServer: {
      hot: true,
      allowedHosts: ['all'],
      static: {
        directory: './dist',
        watch: true
      }
    }
  }
}
