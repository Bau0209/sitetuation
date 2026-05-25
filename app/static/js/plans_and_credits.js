const body = document.body;
let currentPlan = body.dataset.initialCurrentPlan || 'free';
if (currentPlan.includes('{')) currentPlan = 'free';

document.getElementById('tabPlans')?.addEventListener('click', () => switchTab('plans'));
document.getElementById('tabCredits')?.addEventListener('click', () => switchTab('credits'));
document.querySelectorAll('.btn-purchase').forEach(btn => {
  const amount = Number(btn.dataset.amount);
  const price = Number(btn.dataset.price);
  btn.addEventListener('click', () => buyCredits(amount, price));
});

function switchTab(tab) {
  document.getElementById('tabPlans').classList.toggle('active', tab === 'plans');
  document.getElementById('tabCredits').classList.toggle('active', tab === 'credits');
  document.getElementById('plansContent').style.display  = tab === 'plans'   ? '' : 'none';
  document.getElementById('creditsContent').style.display = tab === 'credits' ? '' : 'none';
}

function refreshPlanButtons() {
  const plans = ['free', 'plus', 'pro'];
  const labels = { free: 'Free', plus: 'Plus', pro: 'Pro' };
  plans.forEach(p => {
    const btn = document.getElementById(p + 'PlanBtn');
    if (!btn) return;
    if (p === currentPlan) {
      btn.textContent = 'Current Plan';
      btn.className = 'plan-btn current';
      btn.onclick = null;
    } else {
      btn.textContent = (p === 'free' ? 'Downgrade to ' : 'Upgrade to ') + labels[p];
      btn.className = 'plan-btn white-btn';
      btn.onclick = () => selectPlan(p);
    }
  });
}

function selectPlan(plan) {
  currentPlan = plan;
  refreshPlanButtons();
  const label = plan.charAt(0).toUpperCase() + plan.slice(1);
  showToast(`Successfully ${plan === 'free' ? 'downgraded to' : 'upgraded to'} ${label} Plan!`);
}

function buyCredits(amount, price) {
  showToast(`Purchased ${amount} credits for ${price} php!`);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2800);
}

refreshPlanButtons();
