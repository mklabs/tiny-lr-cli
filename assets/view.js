class View extends Yov {

  template ({id, url}) {
    return this.hx`
      <div class="dashboard-card mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--8-col-desktop">
        <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">
          <h2 class="dashboard-card-title mdl-card__title-text">${url}</h2>
        </div>
        <div class="mdl-card__supporting-text mdl-color-text--grey-600">
          id: ${id}
        </div>
      </div>
    `;
  }

}

module.exports = View;
