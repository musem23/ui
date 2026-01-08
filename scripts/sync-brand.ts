import { execSync } from 'child_process'

const BRAND_REPO = 'origin'
const BRAND_BRANCH = 'main'
const SYNC_PATHS = ['brand/', 'styles/globals.css', 'components/ui/', 'lib/']

async function syncBrand() {
  console.log('Syncing brand assets...')

  try {
    // Fetch latest from brand repo
    execSync(`git fetch ${BRAND_REPO} ${BRAND_BRANCH}`, { stdio: 'inherit' })

    // Checkout brand files from remote
    for (const path of SYNC_PATHS) {
      console.log(`Syncing ${path}...`)
      execSync(`git checkout ${BRAND_REPO}/${BRAND_BRANCH} -- ${path}`, { stdio: 'inherit' })
    }

    console.log('Brand assets synced successfully!')
  } catch (error) {
    console.error('Error syncing brand:', error)
    process.exit(1)
  }
}

syncBrand()
