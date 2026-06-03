const body = document.body;
let currentPlan = document.body.dataset.initialCurrentPlan || 'free';

document.getElementById('tabPlans')?.addEventListener('click', () => switchTab('plans'));
document.getElementById('tabCredits')?.addEventListener('click', () => switchTab('credits'));

function switchTab(tab) {
  document.getElementById('tabPlans').classList.toggle('active', tab === 'plans');
  document.getElementById('tabCredits').classList.toggle('active', tab === 'credits');
  document.getElementById('plansContent').style.display = tab === 'plans' ? '' : 'none';
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
      btn.onclick = () => navigateToMain();
    } else {
      btn.textContent = (p === 'free' ? 'Downgrade to ' : 'Upgrade to ') + labels[p];
      btn.className = 'plan-btn white-btn';
      btn.onclick = () => selectPlan(p);
    }
  });
}

function navigateToMain() {
  window.location.href = '/main';
}

function selectPlan(plan) {
  const prices = { plus: '600 PHP', pro: '1,000 PHP' };
  const label = plan.charAt(0).toUpperCase() + plan.slice(1);

  document.getElementById('modalPlanName').textContent = `${label} Plan`;
  document.getElementById('modalPlanPrice').textContent = prices[plan];
  document.getElementById('paymentModal').dataset.selectedType = 'plan';
  document.getElementById('paymentModal').dataset.selectedPlan = plan;
  document.getElementById('paymentModal').style.display = 'flex';
}

function buyCredits(amount, price) {
  document.getElementById('modalPlanName').textContent = `${amount} Credits`;
  document.getElementById('modalPlanPrice').textContent = `${price} PHP`;
  const modal = document.getElementById('paymentModal');
  modal.dataset.selectedType = 'credits';
  modal.dataset.selectedAmount = amount;
  modal.dataset.selectedPrice = price;
  modal.style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

// Payment confirmation handler for the "Proceed with Payment" button.
// This function is called from the payment modal in plans_and_credits.html.
async function confirmPayment() {
  const modal = document.getElementById('paymentModal');
  const selectedType = modal.dataset.selectedType;

  const method = document.querySelector('input[name="paymentMethod"]:checked').value;

  const methodLabels = {
    'credit-card': 'Credit Card',
    'mobile-wallet': 'Mobile Wallet',
    'bank-transfer': 'Bank Transfer'
  };

  try {
    if (selectedType === 'plan') {
      const plan = modal.dataset.selectedPlan;

      const res = await fetch('/update_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message);
        return;
      }

      currentPlan = data.plan;
      refreshPlanButtons();

      const label = plan.charAt(0).toUpperCase() + plan.slice(1);
      showToast(`Successfully upgraded to ${label} via ${methodLabels[method]}!`);
    }

    else if (selectedType === 'credits') {
      const amount = parseInt(modal.dataset.selectedAmount);

      const res = await fetch('/add_credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: amount })
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message);
        return;
      }

      showToast(`Purchased ${amount} credits via ${methodLabels[method]}!`);

      closePaymentModal();

      setTimeout(navigateToMain, 600);
      return;
    }

  } catch (err) {
    console.error(err);
    showToast('Payment failed. Try again.');
  }

  closePaymentModal();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 2800);
}

refreshPlanButtons();
