class DistritosController < ApplicationController
  # GET /distritos
  # GET /distritos.json
  def index
    @distritos = Distrito.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @distritos }
    end
  end

  # GET /distritos/1
  # GET /distritos/1.json
  def show
    @distrito = Distrito.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @distrito }
    end
  end

  # GET /distritos/new
  # GET /distritos/new.json
  def new
    @distrito = Distrito.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @distrito }
    end
  end

  # GET /distritos/1/edit
  def edit
    @distrito = Distrito.find(params[:id])
  end

  # POST /distritos
  # POST /distritos.json
  def create
    @distrito = Distrito.new(params[:distrito])

    respond_to do |format|
      if @distrito.save
        format.html { redirect_to @distrito, notice: 'Distrito was successfully created.' }
        format.json { render json: @distrito, status: :created, location: @distrito }
      else
        format.html { render action: "new" }
        format.json { render json: @distrito.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /distritos/1
  # PUT /distritos/1.json
  def update
    @distrito = Distrito.find(params[:id])

    respond_to do |format|
      if @distrito.update_attributes(params[:distrito])
        format.html { redirect_to @distrito, notice: 'Distrito was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @distrito.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /distritos/1
  # DELETE /distritos/1.json
  def destroy
    @distrito = Distrito.find(params[:id])
    @distrito.destroy

    respond_to do |format|
      format.html { redirect_to distritos_url }
      format.json { head :no_content }
    end
  end
end
